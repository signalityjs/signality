# Signality coding standards

This document outlines coding standards and best practices for contributing to Signality. These guidelines help ensure consistency, maintainability, and quality across the codebase. We encourage contributors to follow these patterns, but understand that every situation is unique.

## TypeScript standards

### Type safety

- **Avoid `any` types**: You should use strict typing. Consider `unknown` if the type is truly unknown
- **Prefer type inference**: Let TypeScript infer types when possible
- **Explicit return types**: You should specify return types for exported functions
- **Generic constraints**: Consider using proper generic constraints to ensure type safety

```typescript
/** Do: */
export function myUtility<T extends string>(value: T): Signal<T> {
  // ...
}

/** Don't: */
export function myUtility(value: any): any {
  // ...
}
```

### Type definitions

- Use **PascalCase** for all type and interface names
- Use **camelCase** for all variable, function, and property names
- Configuration objects should be named with `*Options` suffix (e.g., `DebouncedOptions`, `BatteryOptions`)
- Result types that return a structure (object with multiple signals/properties) should be named with `*Ref` suffix (e.g., `BatteryRef`, `FullscreenRef`, `ClipboardRef`)

```typescript
/** Do: */
export interface BatteryOptions extends WithInjector {
  readonly pollingInterval?: number;
}

export interface BatteryRef {
  readonly level: Signal<number>;
  readonly charging: Signal<boolean>;
}

/** Don't: */
export interface BatteryConfig {
  // ...
}

export interface Battery {
  // ...
}
```

## Return type patterns

Utilities can return either a single `Signal` or a `*Ref` structure. The choice depends on the complexity and nature of the utility.

### Direct signal return

Utilities that return a single `Signal<T>` directly should:
- Support `CreateSignalOptions` via type extension (e.g., `CreateSignalOptions<T> & WithInjector`)
- Be used for simple, single-state tracking
- Not include any action methods

```typescript
/** Do: */
export type ActiveElementOptions = CreateSignalOptions<Element | null> & WithInjector;

export function activeElement(options?: ActiveElementOptions): Signal<Element | null> {
  const { runInContext } = setupContext(options?.injector, activeElement);
  
  return runInContext(({ isServer }) => {
    const active = signal<Element | null>(null, options);
    // ... implementation
    return active.asReadonly();
  });
}

/** Don't: */
export function activeElement(): Signal<Element | null> {
  // ❌ Missing CreateSignalOptions support
  return signal(null);
}
```

**Examples**: `activeElement()`, `elementHover()`

### Ref structure return

Utilities that return a `*Ref` interface should be used when:
- The utility exposes multiple related signals or properties
- The utility includes action methods (e.g., `enter()`, `exit()`, `start()`, `stop()`)
- The logic involves multiple related states (e.g., `isSupported` + main state)
- The utility wraps Web APIs with weak browser support (requires `isSupported` signal)

```typescript
/** Do: */
export interface FullscreenRef {
  readonly isSupported: Signal<boolean>;
  readonly isFullscreen: Signal<boolean>;
  readonly enter: () => Promise<void>;
  readonly exit: () => Promise<void>;
  readonly toggle: () => Promise<void>;
}

export function fullscreen(
  target?: MaybeTargetSignal<HTMLElement>,
  options?: WithInjector
): FullscreenRef {
  // ... implementation
}

/** Don't: */
export function fullscreen(): Signal<boolean> {
  // ❌ Missing isSupported, missing actions
  return signal(false);
}
```

**Examples**: `fullscreen()`, `battery()`, `bluetooth()`, `gamepad()`

## Context management

Utilities should use the `setupContext` helper function for proper dependency injection, SSR support, and cleanup handling:

```typescript
/** Do: */
export function myUtility(options?: MyOptions) {
  const { runInContext } = setupContext(options?.injector, myUtility);
  
  return runInContext((ctx) => {
    const { injector, onCleanup, isServer, isBrowser, isMobile } = ctx;
    
    // All utility logic here
    if (isServer) {
      return createServerFallback();
    }
    
    // Browser-only code
    const cleanup = setupBrowserAPI();
    onCleanup(() => cleanup());
    
    return createRef();
  });
}

/** Don't: */
export function myUtility(options?: MyOptions) {
  // ❌ Direct access to browser APIs without SSR check
  const result = window.someAPI();
  
  // ❌ No cleanup handling
  // ❌ No SSR support
  return result;
}
```

### Context usage guidelines

- **Logic inside `runInContext`**: You should keep browser API access and DI operations inside `runInContext`
- **Use `isServer` flag**: Consider checking `isServer` before accessing browser-only APIs
- **Register cleanup**: You should use `onCleanup` for resources that need cleanup (event listeners, timers, subscriptions)
- **Use provided injector**: Consider using the `injector` from context rather than direct `inject()` calls

## Injector configuration

`*Options` interfaces should extend `WithInjector` to allow passing a specific injector:

```typescript
/** Do: */
export interface MyUtilityOptions extends WithInjector {
  readonly someOption?: string;
  readonly injector?: Injector;  // Optional, from WithInjector
}

/** Don't: */
export interface MyUtilityOptions {
  readonly someOption?: string;
  // ❌ Missing injector support
}
```

## RxJS usage

You should avoid using RxJS (Observables, Subjects, Operators) unless Angular's external API explicitly requires it.

**When to use RxJS:**
- When integrating with Angular APIs that return Observables (e.g., `HttpClient`, `Router.events`)
- When working with third-party libraries that only provide Observable-based APIs

```typescript
/** Do: */
import { listener } from '@signality/core/browser/listener';

export function myUtility() {
  // ...
  listener(window, 'resize', () => {
    // Handle resize
  });
}

/** Don't: */
import { fromEvent } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export function myUtility() {
  // ...
  fromEvent(window, 'resize')
    .pipe(takeUntilDestroyed())
    .subscribe(() => {
      // Handle resize
    });  // ❌ Unnecessary RxJS usage
}
```

## SSR Compatibility

### Browser API guards

You should guard browser-only APIs with `isServer` checks:

```typescript
/** Do: */
const { runInContext } = setupContext(options?.injector, myUtility);
return runInContext(({ isServer }) => {
  if (isServer) {
    // return fallback
  }
  
  // Safe to use browser APIs
  const api = window.someAPI;
  // return value
});

/** Don't: */
export function myUtility() {
  // ❌ Will crash on server
  const api = window.someAPI;
  return signal(api.value);
}
```

### Default values

You should provide sensible defaults for server-side rendering:

```typescript
/** Do: */
if (isServer) {
  return {
    level: signal(1.0),
    charging: signal(false),
    isSupported: signal(false),
  };
}

/** Don't: */
if (isServer) {
  return null;  // ❌ Breaks SSR
}
```

## Code organization

### File structure

- Consider organizing one utility per file
- Test files should be placed alongside implementation (`*.test.ts`)
- Consider exporting from index files for better discoverability

```
projects/core/browser/battery/
├── index.ts          # Implementation
├── index.test.ts     # Tests
└── ng-package.json   # Package config
```

### Internal vs Public API

- **Public API**: Exported from `projects/core/index.ts` or package root
- **Internal API**: Exported from `projects/core/internal/index.ts`
- Use `@signality/core/internal` for internal utilities
- Public types (`MaybeSignal`, `MaybeElementSignal`, `WithInjector`) are exported from `@signality/core`

```typescript
/** Do: */
import { setupContext } from '@signality/core/internal';
import type { MaybeSignal } from '@signality/core';

/** Don't: */
import { setupContext } from '@signality/core';  // ❌ Internal API
```

## Documentation (TSDoc)

### Function documentation

Exported functions should include comprehensive TSDoc:

```typescript
/**
 * Creates a debounced signal that delays value updates.
 *
 * @description
 * When the source signal changes, the debounced signal waits for `timeMs`
 * milliseconds of inactivity before updating its value.
 *
 * @remarks
 * - **SSR Safe**: Works correctly during server-side rendering
 * - **Auto Cleanup**: Timer is automatically cleared on component destroy
 *
 * @typeParam T - The type of the signal value
 *
 * @param source - The source signal to debounce
 * @param timeMs - Debounce delay in milliseconds (can be a signal)
 * @param options - Optional configuration including `injector` for DI context
 *
 * @returns A readonly signal that updates after the debounce delay
 *
 * @example
 * ```typescript
 * const input = signal('');
 * const debouncedInput = debounced(input, 300);
 * ```
 *
 * @public
 */
export function debounced<T>(...): Signal<T> {
  // ...
}
```

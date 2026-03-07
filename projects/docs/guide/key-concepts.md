# Key concepts

Understanding these core concepts will help you get the most out of Signality.

## Signal-first design

Signality is built on Angular Signals. Utilities rely on a pull-based reactivity model, dependency injection, and other Angular-specific features.

**What this means for you:**

- **No RxJS dependencies** — No need to work with observables, operators, or subscriptions
- **Composable** — Combine utilities naturally using `computed()` / `effect()`
- **SSR-safe** — All utilities work correctly during server-side rendering

```angular-ts
import { Component, computed, effect } from '@angular/core';
import { battery, webNotification } from '@signality/core';

@Component({ /* ... */ })
export class Demo {
  readonly battery = battery();
  readonly notification = webNotification();

  readonly isLowBattery = computed(() => 
    this.battery.level() < 0.2 && !this.battery.charging()
  );

  constructor() {
    effect(() => {
      if (this.isLowBattery()) {
        if (this.notification.permission() === 'granted') {
          this.notification.show('Low Battery', {
            body: 'Battery is below 20%. Some features may be limited.'
          });
        }
      }
    });
  }
}
```

## Reactive input parameters

Signality preserves reactivity not only at the computed result level but also at the input parameter level. This is especially important when building component logic that's configured using reactive [inputs](https://angular.dev/guide/components/inputs) or [queries](https://angular.dev/guide/components/queries).

Most utility parameters accept [`MaybeSignal<T>`](/reference/utility-types#maybesignal-lt-type-gt), which allows you to pass either a **non-reactive** value or a **reactive**:

```typescript
type MaybeSignal<T> = T | Signal<T>;
```

For instance, this enables utilities to work seamlessly with both reactive queries and non-reactive elements obtained through `inject()`:

```typescript
import { viewChild, ElementRef } from '@angular/core';
import { elementSize } from '@signality/core';

@Component({ /* ... */ })
export class Demo {
  readonly host = inject(ElementRef); // Non-reactive element [!code highlight]
  readonly hostSize = elementSize(this.host);

  readonly child = viewChild<ElementRef>('child'); // Reactive element [!code highlight]
  readonly childSize = elementSize(this.child); // Also works
}
```

## Automatic cleanup

Signality completely abstracts away manual resource cleanup. All resources are automatically released when the view is destroyed, including:

- event listeners (DOM events, router events)
- observers (ResizeObserver, IntersectionObserver, etc.)
- timers and intervals
- browser API subscriptions
- internal effects / RxJS subscriptions

**How it works:**

All utilities must be called within Angular's [injection context](https://angular.dev/guide/di/dependency-injection-context#) (constructors, field initializers, etc.). If you need to use a utility outside this context, you can pass an `injector` option. Signality uses Angular's `DestroyRef` internally to register cleanup callbacks automatically.

```typescript
import { inject, ElementRef } from '@angular/core';
import { resizeObserver, routerListener } from '@signality/core';

@Component({ /* ... */ })
export class Demo {
  readonly el = inject(ElementRef);

  // All resources are automatically released
  readonly observer = resizeObserver(this.el, console.log); // [!code highlight]
  readonly listener = routerListener('navigationend', console.log); // [!code highlight]
}
```

## Token-based utilities

Some utilities track **global browser or document state** that is shared across your entire application. These utilities should be used as **singletons** to ensure efficiency and consistency.

**The problem without singleton pattern:**

```typescript
// Component 1
const active1 = activeElement(); // Creates signal + window listeners

// Component 2
const active2 = activeElement(); // Creates next signal + next set of listeners

// Component 3
const active3 = activeElement(); // And another one...
```

**The solution: [InjectionToken](https://angular.dev/api/core/InjectionToken)**

Global state utilities provide an `InjectionToken` that ensures a singleton instance through Angular's dependency injection:

```typescript
import { inject } from '@angular/core';
import { ACTIVE_ELEMENT } from '@signality/core'; // [!code ++]

@Component({ /* ... */ })
export class HeaderComponent {
  readonly activeEl = inject(ACTIVE_ELEMENT);
}

@Component({ /* ... */ })
export class SidebarComponent {
  // Same signal - shared across all components
  readonly activeEl = inject(ACTIVE_ELEMENT);
}
```

**When to use the token vs. the function:**

- Use `inject(TOKEN)` when you need the global singleton
- Use the function directly when you need an isolated instance with custom options

```typescript
// Implies singleton usage
const global = inject(ACTIVE_ELEMENT);

// Isolated instance with custom options
const local = activeElement({ debugName: 'MyActiveElement' });
```

::: tip Tree-shakable
All provided tokens are **tree-shakable**, meaning unused tokens and their associated utilities will be automatically removed from your production bundle, keeping your application size minimal.
:::

## Native signal options

Signality preserves native Angular signal and effect options. When a utility returns a signal directly, you can pass standard `CreateSignalOptions` like `debugName` or custom `equal` functions. Similarly, when utilities return `EffectRef`, they support effect creation options.

```typescript
import { queryParams } from '@signality/core';

// Custom equality function for query params
const routeParams = queryParams<{ id: string }>({
  equal: (a, b) => a.id === b.id,
  debugName: 'UserParams'
});
```

## Context-aware execution

Signality utilities are aware of their execution context and adapt accordingly:

- **SSR support** — Browser-only APIs are guarded and return safe defaults on the server
- **Device detection** — Some computations may be skipped on mobile devices when unnecessary, or optimized for mobile when beneficial

**SSR Compatibility:**

All utilities automatically handle server-side rendering. You never need to wrap utilities in `isPlatformBrowser()` checks:

```typescript
import { battery } from '@signality/core';

@Component({ /* ... */ })
export class Demo {
  // Works on both server and client automatically
  readonly batteryInfo = battery();
  // On server: returns safe defaults
  // On client: returns actual battery status
}
```

## Browser API support detection

Some utilities that rely on browser APIs with limited support expose an `isSupported` signal in their `*Ref` return value. This signal indicates whether the underlying browser API is available and supported in the current environment.

**Why this exists:**

Utilities that operate with browser APIs that don't yet have widespread support (e.g., [IdleDetector API](https://developer.mozilla.org/en-US/docs/Web/API/IdleDetector), [Device Posture API](https://developer.mozilla.org/en-US/docs/Web/API/Device_Posture_API), [EyeDropper API](https://developer.mozilla.org/en-US/docs/Web/API/EyeDropper_API)) use this flag to help you provide appropriate fallbacks to users.

**Important considerations:**

- **Client-side fallback** — `isSupported` is a business state primarily intended for display purposes, not for server-side validation
- **SSR behavior** — On the server, all browser utilities are safe by default and are considered "not supported"

```angular-ts
import { eyeDropper } from '@signality/core';

@Component({ 
  template: `
    <!-- check support for UI rendering --> 
    @if (eyeDropper.isSupported()) { <!-- [!code ++] -->
      <button (click)="pickColor()">Pick Color</button>
    } @else {
      <p>Color picker is not available in your browser</p>
    }
  `
})
export class Demo {
  readonly eyeDropper = eyeDropper();
}
```

## Avoiding hidden dependencies

Utilities that return `*Ref` containers with methods are designed to be safely callable within reactive contexts (`effect()`) without tracking hidden dependencies.

All `*Ref` methods use `untracked()` internally when reading signals, ensuring that any signals accessed within these methods won't be registered as dependencies:

```typescript
import { effect, signal } from '@angular/core';
import { debounced, interval } from '@signality/core';

@Component({ /* ... */ })
export class Demo {
  readonly time = signal(300);
  readonly intervalRef = interval(console.log, this.time);

  constructor() {
    effect(() => {
      // Safe to call - no hidden dependencies created
      this.intervalRef.pause();
      this.intervalRef.resume();
    });
  }
}
```

**What this means for you:**

- **Predictable behavior** — Effects only re-run when their explicit dependencies change
- **Safe composition** — You can freely call `*Ref` methods within any reactive context

## Naming conventions

Signality follows consistent naming conventions for easy discovery and understanding:

| Unit             | Pattern            | Example                       | Description                  |
|------------------|--------------------|-------------------------------|------------------------------|
| `type/interface` | `*Options`         | `DebouncedOptions`            | Configuration object type    |
| `type/interface` | `*Ref`             | `BatteryRef`, `FullscreenRef` | Return type                  |
| `function`       | `camelCase`        | `debounced()`, `webWorker()`  | Utility function             |
| `const`          | `UPPER_SNAKE_CASE` | `ACTIVE_ELEMENT`, `NETWORK`   | InjectionToken for singleton |

**Example:**

```typescript
function fullscreen(options?: FullscreenOptions): FullscreenRef;

interface FullscreenOptions extends WithInjector {
  readonly target?: MaybeElementSignal<HTMLElement>;
}

interface FullscreenRef {
  readonly isFullscreen: Signal<boolean>;
  readonly enter: () => Promise<void>;
  readonly exit: () => Promise<void>;
  readonly toggle: () => Promise<void>;
}
```

## Why no prefixes?

Signality utilities are provided without prefixes like `use*` or `inject*` that are common in other frameworks.

**The reason:**

Angular's class-based architecture allows us to define properties in the instance scope with the same names as the imported factory functions:

```angular-ts
export class Demo {
  readonly battery = battery();
}
```

Since the utility architecture intentionally assumes that these functions will be called within the initialization context (field initializers, constructors), we don't add any unnecessary prefixes.

**Utilities as blueprints:**

Despite being factory functions, utilities should be thought of as **blueprints** by default. When you call a utility, you create an instance based on it that encapsulates the desired behavior within your component's instance scope.

This design choice:

- **Reduces verbosity** — No need for `useBattery()` or `injectBattery()` prefixes
- **Improves readability** — Property names match their purpose directly

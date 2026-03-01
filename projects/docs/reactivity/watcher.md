---
source: https://github.com/signalityjs/signality/blob/main/projects/core/reactivity/watcher/index.ts
---

# Watcher

Watches one or more signals and calls a callback when they change, skipping the initial call.

::: warning Important considerations for signal-based reactivity
Signals are [glitch-free](https://en.wikipedia.org/wiki/Reactive_programming#Glitches) by design and don't propagate changes instantly. In synchronous execution contexts, the consumer will be notified only once and will receive only the final actual value after all synchronous updates complete.
:::

## Usage

### Single source

Watch a single signal and react to changes:

```angular-ts
import { Component, signal } from '@angular/core';
import { watcher } from '@signality/core';

@Component({
  template: `<p>Count: {{ count() }}</p>`,
})
export class CounterComponent {
  readonly count = signal(0);

  constructor() {
    watcher(this.count, (curr, prev) => { // [!code highlight]
      console.log('Count changed from', prev, 'to', curr);
    });
  }
}
```

### Multiple sources

Watch multiple signals and react when any of them changes:

```angular-ts
import { Component, signal } from '@angular/core';
import { watcher } from '@signality/core';

@Component({
  template: `
    <p>Name: {{ name() }}</p>
    <p>Age: {{ age() }}</p>
  `,
})
export class UserComponent {
  readonly name = signal('John');
  readonly age = signal(25);

  constructor() {
    watcher([this.name, this.age], ([name, age]) => { // [!code highlight]
      console.log('User changed:', { name, age });
    });
  }
}
```

## Effect vs Watcher

Unlike the built-in [`effect()`](https://angular.dev/api/core/effect) function, `watcher()` responds to the fact of state change, enabling event-like orchestration of side effects.

| Behavior            | Effect               | Watcher                        |
|---------------------|----------------------|--------------------------------|
| Initial call        | Executes immediately | Skips initial call             |
| Dependency tracking | Automatic (implicit) | Explicit (you specify sources) |

## Parameters

| Parameter         | Type                                                                   | Description                                                                           |
|-------------------|------------------------------------------------------------------------|---------------------------------------------------------------------------------------|
| `sourceOrSources` | `Signal<V>` or `readonly Signal<any>[]`                                | Single signal or array of signals to watch                                            |
| `fn`              | `(curr: V, prev: V, onCleanup: EffectCleanupRegisterFn) => void` or `(curr: SignalValues<T>, prev: SignalValues<T>, onCleanup: EffectCleanupRegisterFn) => void` | Callback function called when signal(s) change. Receives current and previous values. |
| `options`         | `CreateWatcherOptions`                                                  | Optional configuration (see [Options](#options) below)                                |

## Options

The `CreateWatcherOptions` extends [`CreateEffectOptions`](https://angular.dev/api/core/CreateEffectOptions):

| Option     | Type       | Default | Description                                                                 |
|------------|------------|---------|-----------------------------------------------------------------------------|
| `once`     | `boolean`  | `false` | If `true`, the watcher will automatically destroy itself after the first change |
| `manualCleanup` | `boolean` | `false` | If `true`, the effect requires manual cleanup. By default, the effect automatically registers itself for cleanup with the current `DestroyRef` |
| `debugName` | `string` | - | Debug name for the effect (used in Angular DevTools) |
| `injector` | [`Injector`](https://angular.dev/api/core/Injector) | -       | Optional injector for DI context                                           |

## Return Value

Returns a `WatcherRef` (alias for `EffectRef`) that can be used to manually destroy the watcher:

```typescript
const watcherRef = watcher(source, callback);
// later, if needed:
watcherRef.destroy();
```

## Examples

### One-time watcher

Use the `once` option to automatically stop watching after the first change:

```angular-ts
import { Component, signal } from '@angular/core';
import { watcher } from '@signality/core';

@Component({
  template: `<p>Status: {{ status() }}</p>`,
})
export class StatusComponent {
  readonly status = signal<'idle' | 'loading' | 'success'>('idle');

  constructor() {
    watcher(
      this.status,
      (curr, prev) => {
        console.log('Status changed from', prev, 'to', curr);
      },
      { once: true } // [!code highlight]
    );
  }
}
```

### Tracking value changes

Use previous values to detect specific changes:

```angular-ts
import { Component, signal } from '@angular/core';
import { watcher } from '@signality/core';

@Component({
  template: `<p>Status: {{ status() }}</p>`,
})
export class StatusComponent {
  readonly status = signal<'idle' | 'loading' | 'success'>('idle');

  constructor() {
    watcher(this.status, (curr, prev) => {
      if (prev === 'idle' && curr === 'loading') {
        console.log('Started loading');
      } else if (prev === 'loading' && curr === 'success') {
        console.log('Completed successfully');
      }
    });
  }
}
```

## Type Definitions

```typescript
interface CreateWatcherOptions extends Omit<CreateEffectOptions, 'allowSignalWrites'> {
  /**
   * If `true`, the watcher will automatically destroy itself after the first change.
   * Defaults to `false`.
   */
  readonly once?: boolean;
}
type WatcherRef = EffectRef;

// Single source overload
function watcher<V>(
  source: Signal<V>,
  fn: (curr: V, prev: V, onCleanup: EffectCleanupRegisterFn) => void,
  options?: CreateWatcherOptions
): WatcherRef;

// Multiple sources overload
function watcher<T extends readonly Signal<any>[]>(
  sources: T,
  fn: (curr: SignalValues<T>, prev: SignalValues<T>, onCleanup: EffectCleanupRegisterFn) => void,
  options?: CreateWatcherOptions
): WatcherRef;

type SignalValues<T extends readonly Signal<any>[]> = {
  readonly [K in keyof T]: SignalValue<T[K]>;
} & readonly unknown[];
```

## Related

- [Effect](https://angular.dev/api/core/effect) — Angular's built-in effect API

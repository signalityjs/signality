---
source: https://github.com/signalityjs/signality/blob/main/projects/core/reactivity/throttled/index.ts
---

# Throttled

Creates a throttled signal that limits how often the value can update.

<Demo name="throttled" />

## Usage

### Writable signal

Creates a new writable signal where both `set()` and `update()` calls are throttled:

```angular-ts
import { Component, effect } from '@angular/core';
import { throttled } from '@signality/core';

@Component({
  template: `
    <input [(ngModel)]="value" />
  `,
})
export class ThrottledInput {
  readonly value = throttled('', 100); // [!code highlight]

  constructor() {
    effect(() => {
      console.log('Throttled:', this.value());
    });
  }
}
```

### Computed signal

Wraps an existing signal with throttle behavior:

```angular-ts
import { Component, signal, effect } from '@angular/core';
import { throttled } from '@signality/core';

@Component({ /* ... */ })
export class ThrottledInput {
  readonly rawValue = signal(0);
  readonly throttledValue = throttled(this.rawValue, 200); // [!code highlight]

  constructor() {
    effect(() => {
      console.log('Throttled:', this.throttledValue());
    });
  }
}
```

## Debounced vs Throttled

| Behavior | Debounced             | Throttled              |
|----------|-----------------------|------------------------|
| Updates  | After inactivity      | At regular intervals   |
| Use case | Wait for user to stop | Limit update frequency |
| Example  | Search input          | Scroll position        |

## Parameters

| Parameter | Type                                                                     | Description                                                     |
|-----------|--------------------------------------------------------------------------|-----------------------------------------------------------------|
| `source`  | `Signal<T>` or `T`                                                       | Source signal to throttle, or initial value for writable signal |
| `timeMs`  | [`MaybeSignal<number>`](/reference/utility-types#maybesignal-lt-type-gt) | Throttle interval in milliseconds                               |
| `options` | `ThrottledOptions<T>`                                                    | Optional configuration (see [Options](#options) below)          |

## Options

The `ThrottledOptions<T>` extends [`CreateSignalOptions<T>`](https://angular.dev/api/core/CreateSignalOptions) and `WithInjector`:

| Option      | Type                                                                 | Description                                                                                        |
|-------------|----------------------------------------------------------------------|----------------------------------------------------------------------------------------------------|
| `equal`     | [`ValueEqualityFn<T>`](https://angular.dev/api/core/ValueEqualityFn) | Custom equality function ([see more](https://angular.dev/guide/signals#signal-equality-functions)) |
| `debugName` | `string`                                                             | Debug name for the signal (development only)                                                       |
| `injector`  | [`Injector`](https://angular.dev/api/core/Injector)                  | Optional injector for DI context                                                                   |

## Return Value

- When passed a **signal** → returns `Signal<T>` (readonly)
- When passed a **value** → returns `WritableSignal<T>`

## Examples

### Scroll position tracking

```angular-ts
import { Component, signal, effect } from '@angular/core';
import { throttled, listener } from '@signality/core';

@Component({
  template: `<p>Scroll Y: {{ scrollY() }}px</p>`,
})
export class ScrollTracker {
  readonly scrollY = throttled(0, 50);

  constructor() {
    listener(window, 'scroll', () => {
      this.scrollY.set(window.scrollY);
    });

    effect(() => {
      // Updates at most every 50ms during scroll
      console.log('Scroll position:', this.scrollY());
    });
  }
}
```

### Mouse position

```angular-ts
import { Component, signal, computed } from '@angular/core';
import { throttled, listener } from '@signality/core';

@Component({
  template: `
    <div class="tracker">
      Mouse: {{ position().x }}, {{ position().y }}
    </div>
  `,
})
export class MouseTracker {
  readonly position = throttled({ x: 0, y: 0 }, 16); // ~60fps

  constructor() {
    listener(document, 'mousemove', (e: MouseEvent) => {
      this.position.set({ x: e.clientX, y: e.clientY });
    });
  }
}
```

## SSR Compatibility

Throttle timers are not started on the server — the initial value is returned immediately.

## Type Definitions

```typescript
type ThrottledOptions<T> = CreateSignalOptions<T> & WithInjector;

// Overload 1: Computed from signal (readonly)
function throttled<S extends Signal<any>>(
  source: S,
  timeMs: MaybeSignal<number>,
  options?: ThrottledOptions<SignalValue<S>>
): Signal<SignalValue<S>>;

// Overload 2: Writable signal from value
function throttled<V>(
  value: V,
  timeMs: MaybeSignal<number>,
  options?: ThrottledOptions<V>
): WritableSignal<V>;
```

## Related

- [Debounced](/reactivity/debounced) — Waits for inactivity instead of rate-limiting
- [ThrottleCallback](/scheduling/throttle-callback) — Throttled callback function

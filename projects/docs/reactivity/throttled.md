---
source: https://github.com/signalityjs/signality/blob/main/projects/core/reactivity/throttled/index.ts
---

# Throttled

Creates a throttled signal that limits how often the value can update. The signal updates immediately on the first change, then at most once per interval.

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

| Option      | Type                                                                 | Default | Description                                                                                        |
|-------------|----------------------------------------------------------------------|---------|------------------------------------------------------------------------------------------------------|
| `leading`   | `boolean`                                                            | `true`  | Apply the update that opens an interval immediately                                                    |
| `trailing`  | `boolean`                                                            | `true`  | Apply the most recent update once the interval ends, so the signal settles on the source's final value |
| `equal`     | [`ValueEqualityFn<T>`](https://angular.dev/api/core/ValueEqualityFn) | -       | Custom equality function ([see more](https://angular.dev/guide/signals#signal-equality-functions))     |
| `debugName` | `string`                                                             | -       | Debug name for the signal (development only)                                                           |
| `injector`  | [`Injector`](https://angular.dev/api/core/Injector)                  | -       | Optional injector for DI context                                                                       |

### Interval edges

With `trailing: false` the signal only ever shows the value that opened each interval, so it can stay permanently out of sync with its source once changes stop.

See [Interval edges](/scheduling/throttle-callback#interval-edges) for the full behavior matrix. Disabling both edges means the signal never updates.

## Return Value

- When passed a **signal** → returns `Signal<T>` (readonly)
- When passed a **value** → returns `WritableSignal<T>`

## Examples

### Scroll position tracking

```angular-ts
import { Component, DOCUMENT, inject, signal, effect } from '@angular/core';
import { throttled, listener } from '@signality/core';

@Component({
  template: `<p>Scroll Y: {{ scrollY() }}px</p>`,
})
export class ScrollTracker {
  readonly window = inject(DOCUMENT).defaultView;
  readonly scrollY = throttled(0, 50);

  constructor() {
    if (this.window) {
      listener(this.window, 'scroll', () => {
        this.scrollY.set(this.window!.scrollY);
      });
    }

    effect(() => {
      // Updates at most every 50ms during scroll
      console.log('Scroll position:', this.scrollY());
    });
  }
}
```

### Mouse position

```angular-ts
import { Component, DOCUMENT, inject, signal, computed } from '@angular/core';
import { throttled, listener } from '@signality/core';

@Component({
  template: `
    <div class="tracker">
      Mouse: {{ position().x }}, {{ position().y }}
    </div>
  `,
})
export class MouseTracker {
  readonly document = inject(DOCUMENT);
  readonly position = throttled({ x: 0, y: 0 }, 16); // ~60fps

  constructor() {
    listener(this.document, 'mousemove', e => {
      this.position.set({ x: e.clientX, y: e.clientY });
    });
  }
}
```

## SSR Compatibility

Throttle timers are not started on the server — the initial value is returned immediately.

## Type Definitions

```typescript
interface ThrottledOptions<T> extends CreateSignalOptions<T>, WithInjector {
  readonly leading?: boolean;
  readonly trailing?: boolean;
}

function throttled<S extends Signal<any>>(
  source: S,
  timeMs: MaybeSignal<number>,
  options?: ThrottledOptions<SignalValue<S>>
): Signal<SignalValue<S>>;

function throttled<V>(
  value: V,
  timeMs: MaybeSignal<number>,
  options?: ThrottledOptions<V>
): WritableSignal<V>;
```

## Related

- [Debounced](/reactivity/debounced) — Waits for inactivity instead of rate-limiting
- [ThrottleCallback](/scheduling/throttle-callback) — Throttled callback function

---
source: https://github.com/signalityjs/signality/blob/main/projects/core/scheduling/interval/index.ts
---

# Interval

Creates a reactive interval that executes a callback function at specified intervals. Automatically handles cleanup and supports reactive interval duration.

<Demo name="interval" />

## Usage

```angular-ts
import { Component } from '@angular/core';
import { interval } from '@signality/core';

@Component({
  template: `
    <p>Status: {{ polling.isActive() ? 'Polling' : 'Stopped' }}</p>
    <button (click)="polling.pause()">Stop</button>
    <button (click)="polling.resume()">Start</button>
  `,
})
export class PeriodicTask {
  readonly polling = interval(async () => {
    await this.checkStatus();
  }, 5000);
  
  async checkStatus() {
    // async operation
  }
}
```

## Parameters

| Parameter    | Type                                                              | Description                                                               |
|--------------|-------------------------------------------------------------------|---------------------------------------------------------------------------|
| `callback`   | `(counter: number) => void`                                       | Function to execute on each interval tick, receives current counter value |
| `intervalMs` | [`MaybeSignal<number>`](/reference/utility-types#maybesignal-lt-type-gt) | Interval duration in milliseconds                                         |
| `options`    | `IntervalOptions`                                                 | Optional configuration (see [Options](#options) below)                    |

## Options

The `IntervalOptions` extends `WithInjector`:

| Option      | Type                                                | Default | Description                               |
|-------------|-----------------------------------------------------|---------|-------------------------------------------|
| `immediate` | `boolean`                                           | `false` | Whether to start the interval immediately |
| `injector`  | [`Injector`](https://angular.dev/api/core/Injector) | -       | Optional injector for DI context          |

## Return Value

The `interval()` function returns an `IntervalRef` object:

| Property   | Type              | Description                                    |
|------------|-------------------|------------------------------------------------|
| `isActive` | `Signal<boolean>` | Whether the interval is currently active       |
| `counter`  | `Signal<number>`  | Number of times the callback has been executed |
| `pause`    | `() => void`      | Pause the interval                             |
| `resume`   | `() => void`      | Resume the interval                            |
| `reset`    | `() => void`      | Reset the counter to 0                         |

## Examples

### Basic interval

```angular-ts
import { Component } from '@angular/core';
import { interval } from '@signality/core';

@Component({
  template: `<p>Updates: {{ interval.counter() }}</p>`,
})
export class BasicInterval {
  readonly interval = interval(counter => {
    console.log('Update!', counter);
  }, 2000, { immediate: true }); // [!code highlight]
}
```

### Reactive interval duration

```angular-ts
import { Component, signal } from '@angular/core';
import { interval } from '@signality/core';

@Component({
  template: `
    <input 
      type="range" 
      min="100" 
      max="5000" 
      step="100"
      [value]="speed()"
      (input)="speed.set(+$any($event.target).value)"
    />
    <p>Interval: {{ speed() }}ms</p>
    <p>Counter: {{ interval.counter() }}</p>
  `,
})
export class ReactiveInterval {
  readonly speed = signal(1000);
  readonly interval = interval(counter => {
    console.log('Tick!', counter);
  }, this.speed);
}
```

## SSR Compatibility

On the server, the interval does not execute and methods are no-ops:

- `isActive()` → `false`
- `counter()` → `0`
- `pause()`, `resume()`, `reset()` → no-op functions

## Type Definitions

```typescript
interface IntervalOptions extends WithInjector {
  /**
   * Whether to start the interval immediately.
   * @default false
   */
  readonly immediate?: boolean;
}

interface IntervalRef {
  readonly isActive: Signal<boolean>;
  readonly counter: Signal<number>;
  readonly pause: () => void;
  readonly resume: () => void;
  readonly reset: () => void;
}

function interval(
  callback: (counter: number) => void,
  intervalMs: MaybeSignal<number>,
  options?: IntervalOptions
): IntervalRef;
```

## Related

- [Debounced](/reactivity/debounced) — Debounce signal updates
- [Throttled](/reactivity/throttled) — Throttle signal updates
- [Watcher](/reactivity/watcher) — Watch signal changes

---
source: https://github.com/signalityjs/signality/blob/main/projects/core/scheduling/interval/index.ts
---

# Interval

Signal-based wrapper around [`setInterval`](https://developer.mozilla.org/en-US/docs/Web/API/Window/setInterval). Creates a reactive interval that executes a callback at specified intervals. The interval starts immediately upon creation and can be stopped with `destroy()`.

<Demo name="interval" />

## Usage

```angular-ts
import { Component, signal } from '@angular/core';
import { interval } from '@signality/core';

@Component({
  template: `
    <p>Ticks: {{ ticks() }}</p>
    <button (click)="polling.destroy()">Stop</button>
  `,
})
export class PeriodicTask {
  readonly ticks = signal(0);

  readonly polling = interval(() => { // [!code highlight]
    this.ticks.update(n => n + 1);
  }, 5000);
}
```

## Parameters

| Parameter    | Type                                                                    | Description                                            |
|--------------|-------------------------------------------------------------------------|--------------------------------------------------------|
| `callback`   | `() => void`                                                            | Function to execute on each interval tick               |
| `intervalMs` | [`MaybeSignal<number>`](/reference/utility-types#maybesignal-lt-type-gt) | Interval duration in milliseconds                      |
| `options`    | `IntervalOptions`                                                       | Optional configuration (see [Options](#options) below) |

## Options

The `IntervalOptions` extends `WithInjector`:

| Option      | Type                                                | Default | Description                                                       |
|-------------|-----------------------------------------------------|---------|-------------------------------------------------------------------|
| `immediate` | `boolean`                                           | `false` | Call the callback immediately, without waiting for the first tick |
| `injector`  | [`Injector`](https://angular.dev/api/core/Injector) | -       | Optional injector for DI context                                  |

## Return Value

The `interval()` function returns an `IntervalRef` object:

| Property  | Type         | Description                   |
|-----------|--------------|-------------------------------|
| `destroy` | `() => void` | Stop the interval permanently |

## Examples

### Polling with immediate first call

```angular-ts
import { Component, signal } from '@angular/core';
import { interval } from '@signality/core';

@Component({
  template: `
    <p>Last update: {{ lastUpdate() }}</p>
  `,
})
export class PollingDemo {
  readonly lastUpdate = signal('');

  readonly poller = interval(() => {
    this.lastUpdate.set(new Date().toLocaleTimeString());
  }, 10_000, { immediate: true }); // [!code highlight]
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
  `,
})
export class ReactiveInterval {
  readonly speed = signal(1000);

  readonly ticker = interval(() => { // [!code highlight]
    console.log('Tick!');
  }, this.speed); // [!code highlight]
}
```

## SSR Compatibility

On the server, `interval` returns a no-op `IntervalRef` that safely handles `destroy()` calls without scheduling any timers.

## Type Definitions

```typescript
interface IntervalOptions extends WithInjector {
  readonly immediate?: boolean;
}

interface IntervalRef {
  readonly destroy: () => void;
}

function interval(
  callback: () => void,
  intervalMs: MaybeSignal<number>,
  options?: IntervalOptions,
): IntervalRef;
```

## Related

- [Debounced](/reactivity/debounced) — Debounce signal updates
- [Throttled](/reactivity/throttled) — Throttle signal updates
- [Watcher](/reactivity/watcher) — Watch signal changes

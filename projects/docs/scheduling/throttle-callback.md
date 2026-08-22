---
source: https://github.com/signalityjs/signality/blob/main/projects/core/scheduling/throttle-callback/index.ts
---

# ThrottleCallback

Creates a throttled version of a callback function. The callback runs immediately on the first call, then at most once per specified wait interval.

::: info Stateless utility
`throttleCallback` is a stateless utility that only limits callback execution frequency. For cases where you need to manage **state transitions**, consider using the [`throttled`](/reactivity/throttled) utility instead, which provides a reactive signal that tracks throttled state changes.
:::

## Usage

```angular-ts
import { Component, output } from '@angular/core';
import { throttleCallback } from '@signality/core';

@Component({
  template: `
    <div (scroll)="handleScroll($event)">Scrollable content</div>
  `,
})
export class ScrollComponent {
  readonly throttleTime = input(300);
  readonly scrollChange = output<Event>();

  readonly handleScroll = throttleCallback((e: Event) => { // [!code highlight]
    this.scrollChange.emit(e); // [!code highlight]
  }, this.throttleTime); // [!code highlight]
}
```

## Parameters

| Parameter  | Type                                                                     | Description                                            |
|------------|--------------------------------------------------------------------------|--------------------------------------------------------|
| `callback` | `T extends (...args: any[]) => any`                                      | The function to throttle                               |
| `wait`     | [`MaybeSignal<number>`](/reference/utility-types#maybesignal-lt-type-gt) | Throttle interval in milliseconds                      |
| `options`  | `ThrottleCallbackOptions`                                                | Optional configuration (see [Options](#options) below) |

## Options

| Option     | Type                                                | Default | Description                                                                   |
|------------|-----------------------------------------------------|---------|-------------------------------------------------------------------------------|
| `leading`  | `boolean`                                           | `true`  | Invoke the callback immediately on the call that opens an interval            |
| `trailing` | `boolean`                                           | `true`  | Deliver the most recent call made during the interval once that interval ends |
| `injector` | [`Injector`](https://angular.dev/api/core/Injector) | -       | Optional injector for DI context                                              |

### Interval edges

`leading` and `trailing` select which edges of the interval invoke the callback. For a burst of `first`, `second`, `last` within one interval:

| `leading` | `trailing` | Invoked with                                | Use case                                              |
|-----------|------------|---------------------------------------------|-------------------------------------------------------|
| `true`    | `true`     | `first` immediately, then `last` at the end | **Default** — instant feedback, exact result          |
| `true`    | `false`    | `first` only                                | Rate-limiting a call with no payload                  |
| `false`   | `true`     | `last` at the end                           | Periodic sampling without reacting to the first event |
| `false`   | `false`    | never invoked                               | None — logs a warning in development                  |

Every invocation opens an interval of its own, so a call arriving just as an interval ends is deferred to the next one rather than running immediately.

## Return Value

Returns a throttled version of the callback function with the same signature.

## SSR Compatibility

On the server, `throttleCallback` returns the original callback function unchanged. No throttling occurs, and the function executes immediately.

## Type Definitions

```typescript
function throttleCallback<T extends (...args: any[]) => any>(
  callback: T,
  wait: MaybeSignal<number>,
  options?: ThrottleCallbackOptions
): T;

interface ThrottleCallbackOptions extends WithInjector {
  readonly leading?: boolean;
  readonly trailing?: boolean;
}
```

## Related

- [Throttled](/reactivity/throttled) — Throttled signal wrapper
- [DebounceCallback](/scheduling/debounce-callback) — Debounced callback function
- [Debounced](/reactivity/debounced) — Debounced signal wrapper

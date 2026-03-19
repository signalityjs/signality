---
source: https://github.com/signalityjs/signality/blob/main/projects/core/scheduling/throttle-callback/index.ts
---

# ThrottleCallback

Creates a throttled version of a callback function. The callback will be executed at most once per specified wait interval.

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
| `options`  | `WithInjector`                                                           | Optional configuration (see [Options](#options) below) |

## Options

| Option     | Type                                                | Default | Description                      |
|------------|-----------------------------------------------------|---------|----------------------------------|
| `injector` | [`Injector`](https://angular.dev/api/core/Injector) | -       | Optional injector for DI context |

## Return Value

Returns a throttled version of the callback function with the same signature.

## SSR Compatibility

On the server, `throttleCallback` returns the original callback function unchanged. No throttling occurs, and the function executes immediately.

## Type Definitions

```typescript
function throttleCallback<T extends (...args: any[]) => any>(
  callback: T,
  wait: MaybeSignal<number>,
  options?: WithInjector
): T;
```

## Related

- [Throttled](/reactivity/throttled) — Throttled signal wrapper
- [DebounceCallback](/scheduling/debounce-callback) — Debounced callback function
- [Debounced](/reactivity/debounced) — Debounced signal wrapper

---
source: https://github.com/signalityjs/signality/blob/main/projects/core/scheduling/debounce-callback/index.ts
---

# DebounceCallback

Creates a debounced version of a callback function. The callback will only be executed after the specified wait time has elapsed since the last invocation.

::: warning Stateless utility
`debounceCallback` is a stateless utility that only delays callback execution. For cases where you need to manage **state transitions**, consider using the [`debounced`](/reactivity/debounced) utility instead, which provides a reactive signal that tracks debounced state changes.
:::

## Usage

```angular-ts
import { Component, output } from '@angular/core';
import { debounceCallback } from '@signality/core';

@Component({
  template: `
    <input (input)="handleInput($event.target.value)" />
  `,
})
export class SearchComponent {
  readonly debounceTime = input(300);
  readonly searchChange = output<string>();

  readonly handleInput = debounceCallback((value: string) => { // [!code highlight]
    this.searchChange.emit(value); // [!code highlight]
  }, this.debounceTime); // [!code highlight]
}
```

## Parameters

| Parameter  | Type                                | Description                                            |
|------------|-------------------------------------|--------------------------------------------------------|
| `callback` | `T extends (...args: any[]) => any` | The function to debounce                               |
| `wait`     | [`MaybeSignal<number>`](/reference/utility-types#maybesignal-lt-type-gt)               | Debounce delay in milliseconds                         |
| `options`  | `WithInjector`                      | Optional configuration (see [Options](#options) below) |

## Options

| Option     | Type       | Default | Description                      |
|------------|------------|---------|----------------------------------|
| `injector` | [`Injector`](https://angular.dev/api/core/Injector) | -       | Optional injector for DI context |

## Return Value

Returns a debounced version of the callback function with the same signature.

## SSR Compatibility

On the server, `debounceCallback` returns the original callback function unchanged. No debouncing occurs, and the function executes immediately.

## Type Definitions

```typescript
function debounceCallback<T extends (...args: any[]) => any>(
  callback: T,
  wait: MaybeSignal<number>,
  options?: WithInjector
): T;
```

## Related

- [Debounced](/reactivity/debounced) — Debounced signal wrapper
- [ThrottleCallback](/scheduling/throttle-callback) — Throttled callback function
- [Throttled](/reactivity/throttled) — Throttled signal wrapper

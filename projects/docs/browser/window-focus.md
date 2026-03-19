---
source: https://github.com/nicolo-ribaudo/signality/blob/main/projects/core/browser/window-focus/index.ts
---

# WindowFocus

Reactive wrapper around the browser's [Window focus/blur events](https://developer.mozilla.org/en-US/docs/Web/API/Window/focus_event). Returns a signal that tracks whether the window is currently focused.

<Demo name="window-focus" />

## Usage

```angular-ts
import { Component, effect } from '@angular/core';
import { windowFocus } from '@signality/core';

@Component({
  template: `
    <p>Window is {{ isFocused() ? 'focused' : 'not focused' }}</p>
  `,
})
export class FocusDemo {
  readonly isFocused = windowFocus(); // [!code highlight]

  constructor() {
    effect(() => {
      if (!this.isFocused()) {
        console.log('User left the window');
      }
    });
  }
}
```

::: warning Use InjectionToken for Singleton
For global state tracking like `windowFocus`, consider using the provided `WINDOW_FOCUS` token instead of calling the function directly. This provides a singleton instance that can be shared across your entire application, reducing memory usage and event listener overhead:

```typescript
import { inject } from '@angular/core';
import { WINDOW_FOCUS } from '@signality/core';

const isFocused = windowFocus(); // [!code --]
const isFocused = inject(WINDOW_FOCUS); // [!code ++]
```

Learn more about [Token-based utilities](/guide/key-concepts#token-based-utilities).
:::

## Parameters

| Parameter | Type                 | Description                                            |
|-----------|----------------------|--------------------------------------------------------|
| `options` | `WindowFocusOptions` | Optional configuration (see [Options](#options) below) |

## Options

The `WindowFocusOptions` extends Angular's [`CreateSignalOptions<boolean>`](https://angular.dev/api/core/CreateSignalOptions) and `WithInjector`:

| Option      | Type                                                                       | Description                                                                                        |
|-------------|----------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------|
| `equal`     | [`ValueEqualityFn<boolean>`](https://angular.dev/api/core/ValueEqualityFn) | Custom equality function ([see more](https://angular.dev/guide/signals#signal-equality-functions)) |
| `debugName` | `string`                                                                   | Debug name for the signal (development only)                                                       |
| `injector`  | [`Injector`](https://angular.dev/api/core/Injector)                        | Optional injector for DI context                                                                   |

## Return Value

Returns a `Signal<boolean>` containing the current window focus state:

- `true` - Window is focused
- `false` - Window is not focused (blurred)

## Examples

### Pause polling when unfocused

```angular-ts
import { Component, effect } from '@angular/core';
import { windowFocus } from '@signality/core';

@Component({
  template: `<p>Data refreshes while window is focused</p>`,
})
export class SmartPolling {
  readonly isFocused = windowFocus();

  constructor() {
    effect(() => {
      if (this.isFocused()) {
        this.startPolling();
      } else {
        this.stopPolling();
      }
    });
  }

  private startPolling() { /* ... */ }
  private stopPolling() { /* ... */ }
}
```

## SSR Compatibility

On the server, the signal initializes with `true`.

## Type Definitions

```typescript
type WindowFocusOptions = CreateSignalOptions<boolean> & WithInjector;

function windowFocus(options?: WindowFocusOptions): Signal<boolean>;
```

## Related

- [PageVisibility](/browser/page-visibility) — Track whether the page is visible or hidden
- [ActiveElement](/elements/active-element) — Track the currently focused element

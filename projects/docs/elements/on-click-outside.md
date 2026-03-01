---
source: https://github.com/signalityjs/signality/blob/main/projects/core/elements/on-click-outside/index.ts
---

# OnClickOutside

Detects clicks outside a target element and invokes a callback. Useful for closing dropdowns, modals, and popovers when the user clicks elsewhere.

<Demo name="on-click-outside" />

## Usage

```angular-ts
import { Component, viewChild, ElementRef, signal } from '@angular/core';
import { onClickOutside } from '@signality/core';

@Component({
  template: `
    @if (isOpen()) {
      <div #dropdown class="dropdown">
        Dropdown content
      </div>
    }
    <button (click)="isOpen.set(true)">Open</button>
  `,
})
export class ClickOutsideDemo {
  readonly dropdown = viewChild<ElementRef>('dropdown');
  readonly isOpen = signal(true);

  constructor() {
    onClickOutside(this.dropdown, () => { // [!code highlight]
      this.isOpen.set(false);
    });
  }
}
```

## Parameters

| Parameter | Type                                                                                        | Description                                            |
|-----------|---------------------------------------------------------------------------------------------|--------------------------------------------------------|
| `target`  | [`MaybeElementSignal<HTMLElement>`](/reference/utility-types#maybeelementsignal-lt-type-gt) | Element to detect clicks outside of                    |
| `handler` | `(event: PointerEvent \| FocusEvent) => void`                                               | Callback invoked on outside click                      |
| `options` | `OnClickOutsideOptions`                                                                     | Optional configuration (see [Options](#options) below) |

## Options

The `OnClickOutsideOptions` extends `WithInjector`:

| Option     | Type                                                | Default | Description                                  |
|------------|-----------------------------------------------------|---------|----------------------------------------------|
| `ignore`   | `MaybeElementSignal<Element>[]`                     | -       | Elements that should not trigger the handler |
| `injector` | [`Injector`](https://angular.dev/api/core/Injector) | -       | Optional injector for DI context             |

## Return Value

Returns an `OnClickOutsideRef`:

| Property  | Type         | Description                        |
|-----------|--------------|------------------------------------|
| `destroy` | `() => void` | Stops listening for outside clicks |

## Examples

### Dropdown with trigger button

```angular-ts
import { Component, viewChild, ElementRef, signal } from '@angular/core';
import { onClickOutside } from '@signality/core';

@Component({
  template: `
    <button #trigger (click)="isOpen.set(!isOpen())">Toggle</button>
    @if (isOpen()) {
      <div #menu class="dropdown-menu">
        <a href="#">Option 1</a>
        <a href="#">Option 2</a>
      </div>
    }
  `,
})
export class DropdownDemo {
  readonly trigger = viewChild<ElementRef>('trigger');
  readonly menu = viewChild<ElementRef>('menu');
  readonly isOpen = signal(false);

  constructor() {
    onClickOutside(this.menu, () => {
      this.isOpen.set(false);
    }, { ignore: [this.trigger] }); // [!code highlight]
  }
}
```

## SSR Compatibility

On the server, the utility returns a no-op ref with an empty `destroy` method.

## Type Definitions

```typescript
interface OnClickOutsideOptions extends WithInjector {
  readonly ignore?: MaybeElementSignal<Element>[];
}

interface OnClickOutsideRef {
  readonly destroy: () => void;
}

function onClickOutside(
  target: MaybeElementSignal<HTMLElement>,
  handler: (event: PointerEvent | FocusEvent) => void,
  options?: OnClickOutsideOptions
): OnClickOutsideRef;
```

## Related

- [ElementFocus](/elements/element-focus) — Track focus state on an element
- [Listener](/browser/listener) — Low-level event listener utility

---
source: https://github.com/signalityjs/signality/blob/main/projects/core/elements/element-focus-within/index.ts
---

# ElementFocusWithin

Reactive tracking of focus-within state on an element. Detects when focus is inside an element or any of its descendants, analogous to the CSS `:focus-within` pseudo-class.

<Demo name="element-focus-within" />

## Usage

```angular-ts
import { Component, viewChild, ElementRef } from '@angular/core';
import { elementFocusWithin } from '@signality/core';

@Component({
  template: `
    <div #container [class.focused]="focusedWithin()">
      <input placeholder="First name" />
      <input placeholder="Last name" />
    </div>
  `,
})
export class FocusWithinDemo {
  readonly container = viewChild<ElementRef>('container');
  readonly focusedWithin = elementFocusWithin(this.container); // [!code highlight]
}
```

## Parameters

| Parameter | Type                                                                                        | Description                                            |
|-----------|---------------------------------------------------------------------------------------------|--------------------------------------------------------|
| `target`  | [`MaybeElementSignal<HTMLElement>`](/reference/utility-types#maybeelementsignal-lt-type-gt) | Target element to track                                |
| `options` | `ElementFocusWithinOptions`                                                                 | Optional configuration (see [Options](#options) below) |

## Options

The `ElementFocusWithinOptions` extends [`CreateSignalOptions<boolean>`](https://angular.dev/api/core/CreateSignalOptions) and `WithInjector`:

| Option      | Type                                                                       | Default | Description                                                                                        |
|-------------|----------------------------------------------------------------------------|---------|----------------------------------------------------------------------------------------------------|
| `equal`     | [`ValueEqualityFn<boolean>`](https://angular.dev/api/core/ValueEqualityFn) | -       | Custom equality function ([see more](https://angular.dev/guide/signals#signal-equality-functions)) |
| `debugName` | `string`                                                                   | -       | Debug name for the signal (development only)                                                       |
| `injector`  | [`Injector`](https://angular.dev/api/core/Injector)                        | -       | Optional injector for DI context                                                                   |

## Return Value

Returns a `Signal<boolean>` containing `true` when focus is within the element or any of its descendants, `false` otherwise.

## Examples

### Form container highlight

```angular-ts
import { Component, viewChild, ElementRef } from '@angular/core';
import { elementFocusWithin } from '@signality/core';

@Component({
  template: `
    <div #form class="form" [class.active]="isActive()">
      <input placeholder="Email" />
      <input placeholder="Password" type="password" />
      <button>Sign In</button>
    </div>
  `,
  styles: `
    .form { border: 2px solid #ccc; padding: 1rem; }
    .form.active { border-color: #6366f1; }
  `,
})
export class FormHighlight {
  readonly form = viewChild<ElementRef>('form');
  readonly isActive = elementFocusWithin(this.form);
}
```

### Dropdown menu

```angular-ts
import { Component, viewChild, ElementRef } from '@angular/core';
import { elementFocusWithin } from '@signality/core';

@Component({
  template: `
    <div #dropdown class="dropdown">
      <button>Menu</button>
      @if (isOpen()) {
        <ul class="dropdown-items">
          <li><button>Option 1</button></li>
          <li><button>Option 2</button></li>
          <li><button>Option 3</button></li>
        </ul>
      }
    </div>
  `,
})
export class DropdownMenu {
  readonly dropdown = viewChild<ElementRef>('dropdown');
  readonly isOpen = elementFocusWithin(this.dropdown);
}
```

## SSR Compatibility

On the server, the signal initializes with `false`.

## Type Definitions

```typescript
type ElementFocusWithinOptions = CreateSignalOptions<boolean> & WithInjector;

function elementFocusWithin(
  target: MaybeElementSignal<HTMLElement>,
  options?: ElementFocusWithinOptions
): Signal<boolean>;
```

## Related

- [ElementFocus](/elements/element-focus) — Track focus state on a single element
- [ElementHover](/elements/element-hover) — Track hover state instead of focus
- [ActiveElement](/elements/active-element) — Track the currently focused element globally

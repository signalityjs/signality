---
source: https://github.com/signalityjs/signality/blob/main/projects/core/elements/element-focus/index.ts
---

# ElementFocus

Reactive tracking of focus state on an element. Detects when an element gains or loses focus, and allows programmatically setting focus.

<Demo name="element-focus" />

## Usage

```angular-ts
import { Component, viewChild, ElementRef } from '@angular/core';
import { elementFocus } from '@signality/core';

@Component({
  template: `
    <input #input [class.focused]="focused()" />
    <p>{{ focused() ? 'Input is focused' : 'Input is not focused' }}</p>
  `,
})
export class FocusDemo {
  readonly input = viewChild<ElementRef>('input');
  readonly focused = elementFocus(this.input); // [!code highlight]
}
```

## Parameters

| Parameter | Type                                                                                        | Description                                            |
|-----------|---------------------------------------------------------------------------------------------|--------------------------------------------------------|
| `target`  | [`MaybeElementSignal<HTMLElement>`](/reference/utility-types#maybeelementsignal-lt-type-gt) | Target element to track                                |
| `options` | `ElementFocusOptions`                                                                       | Optional configuration (see [Options](#options) below) |

## Options

The `ElementFocusOptions` extends [`CreateSignalOptions<boolean>`](https://angular.dev/api/core/CreateSignalOptions) and `WithInjector`:

| Option          | Type                                                                       | Default | Description                                                                                                                                                                                                                                                                                                        |
|-----------------|----------------------------------------------------------------------------|---------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `equal`         | [`ValueEqualityFn<boolean>`](https://angular.dev/api/core/ValueEqualityFn) | -       | Custom equality function ([see more](https://angular.dev/guide/signals#signal-equality-functions))                                                                                                                                                                                                                 |
| `debugName`     | `string`                                                                   | -       | Debug name for the signal (development only)                                                                                                                                                                                                                                                                       |
| `focusVisible`  | `boolean`                                                                  | `false` | Track focus using the `:focus-visible` pseudo-class. The browser uses heuristics to determine when focus should be visually indicated (e.g., keyboard navigation, programmatic focus). See [MDN: :focus-visible](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:focus-visible) for details. |
| `preventScroll` | `boolean`                                                                  | `false` | Prevent scrolling to the element when it is focused                                                                                                                                                                                                                                                                |
| `injector`      | [`Injector`](https://angular.dev/api/core/Injector)                        | -       | Optional injector for DI context                                                                                                                                                                                                                                                                                   |

## Return Value

Returns a `WritableSignal<boolean>` containing `true` when the element has focus, `false` otherwise. You can use `.set(true)` to programmatically focus the element and `.set(false)` to blur it.

## Examples

### Focus ring

```angular-ts
import { Component, viewChild, ElementRef } from '@angular/core';
import { elementFocus } from '@signality/core';

@Component({
  template: `
    <button #btn [class.focus-ring]="focused()">
      Click or Tab to me
    </button>
  `,
})
export class FocusRing {
  readonly btn = viewChild<ElementRef>('btn');
  readonly focused = elementFocus(this.btn, { focusVisible: true });
}
```

### Programmatic focus setting

```angular-ts
import { Component, viewChild, ElementRef, signal } from '@angular/core';
import { elementFocus } from '@signality/core';

@Component({
  template: `
    <div class="input-wrapper">
      <input #input [(ngModel)]="query" />
      @if (query()) {
        <button (click)="clear()">×</button>
      }
    </div>
  `,
})
export class SearchInput {
  readonly inputEl = viewChild('input', { read: ElementRef });
  readonly inputFocused = elementFocus(this.inputEl);
  readonly query = signal('');

  clear() {
    this.query.set('');
    this.inputFocused.set(true); // Return focus after clearing // [!code highlight]
  }
}
```

## SSR Compatibility

On the server, the signal initializes with `false`.

## Type Definitions

```typescript
interface ElementFocusOptions extends CreateSignalOptions<boolean>, WithInjector {
  readonly focusVisible?: boolean;
  readonly preventScroll?: boolean;
}

function elementFocus(
  target: MaybeElementSignal<HTMLElement>,
  options?: ElementFocusOptions
): WritableSignal<boolean>;
```

## Related

- [ElementHover](/elements/element-hover) — Track hover state instead of focus
- [ActiveElement](/elements/active-element) — Track the currently focused element globally

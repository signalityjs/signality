---
source: https://github.com/signalityjs/signality/blob/main/projects/core/utilities/to-element.ts
---

# ToElement

Converts a [`MaybeElementSignal`](/reference/utility-types#maybeelementsignal-lt-type-gt) to a raw DOM element. Handles element refs, signals, and plain elements uniformly.

## Usage

```angular-ts
import { signal } from '@angular/core';
import { toElement } from '@signality/core';

const elementRef = signal<ElementRef<HTMLElement> | null>(null);

toElement(elementRef); // HTMLElement | null // [!code highlight]
```

## With `untracked`

The `untracked` variant reads the element without tracking it as a dependency:

```angular-ts
import { effect, signal, ElementRef } from '@angular/core';
import { toElement } from '@signality/core';

const buttonRef = signal<ElementRef<HTMLButtonElement> | null>(null);

effect(() => {
  // This effect tracks buttonRef
  console.log('Tracked:', toElement(buttonRef));
});

effect(() => {
  // This effect does NOT track buttonRef
  console.log('Untracked:', toElement.untracked(buttonRef)); // [!code highlight]
});
```

## Examples

### Working with template refs

```angular-ts
import { Component, viewChild, ElementRef } from '@angular/core';
import { toElement } from '@signality/core';

@Component({
  template: `
    <input #input />
    <button (click)="focusInput()">Focus</button>
  `,
})
export class InputFocus {
  readonly inputRef = viewChild.required('input', { read: ElementRef });

  focusInput() {
    toElement(this.inputRef).focus();
  }
}
```

## Type Definitions

```typescript
type MaybeElementSignal<T extends Element> =
  | T
  | ElementRef<T>
  | Signal<T | ElementRef<T> | null>
  | Signal<T | ElementRef<T> | undefined>
  | Signal<T | ElementRef<T> | null | undefined>;

interface ToElementFn extends ToElementBase {
  untracked: ToElementBase;
}

interface ToElementBase {
  <T extends Element>(element: T | ElementRef<T>): T;
  <T extends Element>(element: Signal<T | ElementRef<T> | null>): T | null;
  <T extends Element>(element: Signal<T | ElementRef<T> | undefined>): T | undefined;
  <T extends Element>(element: Signal<T | ElementRef<T> | null | undefined>): T | null | undefined;
  <T extends Element>(element: T | ElementRef<T> | Signal<T | ElementRef<T> | null | undefined>):
    | T
    | null
    | undefined;
}
```

## Related

- [ToValue](/utilities/to-value) — Similar utility for unwrapping signal values

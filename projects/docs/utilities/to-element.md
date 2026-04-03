---
source: https://github.com/signalityjs/signality/blob/main/projects/core/utilities/to-element.ts
---

# ToElement

Converts a [`MaybeElementSignal`](/reference/utility-types#maybeelementsignallttypegt) to a raw DOM element. Handles element refs, signals, and plain elements uniformly.

## Usage

```angular-ts
import { signal } from '@angular/core';
import { toElement } from '@signality/core';

const button = signal<HTMLButtonElement | null>(null);

toElement(button);     // HTMLButtonElement | null
toElement(button());   // HTMLButtonElement | null
```

## Signature

```typescript
interface ToElementFn {
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

## With `untracked`

The `untracked` variant reads the element without tracking it as a dependency:

```angular-ts
import { effect, signal, ElementRef } from '@angular/core';
import { toElement } from '@signality/core';

const buttonRef = signal<ElementRef<HTMLButtonElement> | null>(null);

effect(() => {
  // This effect tracks buttonRef
  const el = toElement(buttonRef);
  console.log('Button:', el);
});

effect(() => {
  // This effect does NOT track buttonRef
  const el = toElement.untracked(buttonRef);
  console.log('Button (untracked):', el);
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
  readonly inputRef = viewChild<HTMLInputElement>('input');

  focusInput() {
    const input = toElement(this.inputRef);
    input?.focus();
  }
}
```

### Type-safe element access

```angular-ts
import { signal } from '@angular/core';
import { toElement } from '@signality/core';

const divSignal = signal<HTMLDivElement | null>(null);

// Type-safe: returns HTMLDivElement | null
const div = toElement(divSignal);
```

## Type Definitions

```typescript
type MaybeElementSignal<T extends Element> =
  | T
  | ElementRef<T>
  | Signal<T | ElementRef<T> | null>
  | Signal<T | ElementRef<T> | undefined>
  | Signal<T | ElementRef<T> | null | undefined>;

interface ToElementFn {
  <T extends Element>(element: T | ElementRef<T>): T;
  <T extends Element>(element: Signal<T | ElementRef<T> | null>): T | null;
  // ... more overloads
}
```

## Related

- [ToValue](/utilities/to-value) — Similar utility for unwrapping signal values

---
source: https://github.com/signalityjs/signality/blob/main/projects/core/types/index.ts
---

# Utility Types

Utility types provided by Signality for working with signals, elements, and reactive values.

## SignalValue&lt;Type&gt;

Extracts the value type from a `Signal`.

```typescript
type SignalValue<S> = S extends Signal<infer V> ? V : never;
```

##### Example

```typescript
import { signal, computed } from '@angular/core';
import type { SignalValue } from '@signality/core'; // [!code ++]

const count = signal(0);
type A = SignalValue<typeof count>; // Number

const user = signal({ id: 1, name: 'John' });
type B = SignalValue<typeof user>; // { id: number; name: string }

const fullName = computed(() => `${user().name} Doe`);
type C = SignalValue<typeof fullName>; // String
```

## MaybeSignal&lt;Type&gt;

Union type that accepts either a static value or a reactive `Signal`.

```typescript
type MaybeSignal<T> = T | Signal<T>;
```

##### Example

```typescript
import { signal } from '@angular/core';
import type { MaybeSignal } from '@signality/core'; // [!code ++]

function processValue(value: MaybeSignal<number>): void {
  // Value can be number | Signal<number>
}

processValue(42); // [!code highlight]
processValue(signal(42)); // [!code highlight]

type A = MaybeSignal<number>;
// Type A = number | Signal<number>

type B = MaybeSignal<string | undefined>;
// Type B = string | undefined | Signal<string | undefined>
```

## MaybeElementSignal&lt;Type&gt;

Union type for element references that can be an element, `ElementRef`, or a `Signal` containing either of these (including `null` or `undefined`).

```typescript
type MaybeElementSignal<T extends Element> =
  | T
  | ElementRef<T>
  | Signal<T | ElementRef<T> | null | undefined>;
```

> **Note:** The signal variant includes `null` and `undefined` because elements may dynamically change in reactive scenarios, particularly with conditional rendering where elements can appear or disappear based on signal values.

##### Example

```typescript
import { ElementRef, signal } from '@angular/core';
import type { MaybeElementSignal } from '@signality/core'; // [!code ++]

function trackElement(element: MaybeElementSignal<HTMLElement>): void {
  // Element can be:
  // | HTMLElement 
  // | ElementRef<HTMLElement> 
  // | Signal<HTMLElement | ElementRef<HTMLElement> | null | undefined>
}

trackElement(document.body); // [!code highlight]
trackElement(new ElementRef(document.body)); // [!code highlight]
trackElement(signal(document.body)); // [!code highlight]
trackElement(signal(null)); // [!code highlight]

type A = MaybeElementSignal<HTMLDivElement>;
// Type A = 
// | HTMLDivElement 
// | ElementRef<HTMLDivElement> 
// | Signal<HTMLDivElement | ElementRef<HTMLDivElement> | null | undefined>
```

## UnrefElement&lt;Type&gt;

Extracts the element type from `ElementRef` or returns the type as-is.

```typescript
type UnrefElement<T> = T extends ElementRef<infer E> ? E : T;
```

##### Example

```typescript
import { ElementRef } from '@angular/core';
import type { UnrefElement } from '@signality/core'; // [!code ++]

type A = UnrefElement<ElementRef<HTMLDivElement>>; // [!code highlight]
// Type A = HTMLDivElement

type B = UnrefElement<HTMLElement>; // [!code highlight]
// Type B = HTMLElement

function getElement<T extends ElementRef<any>>(ref: T): UnrefElement<T> {
  return ref.nativeElement;
}

const divRef = new ElementRef<HTMLDivElement>(document.createElement('div'));
const element = getElement(divRef); // [!code highlight]
// Const element: HTMLDivElement
```

## Related

- [Key Concepts](/guide/key-concepts) — Learn about Signal-First Design and common patterns
- [Debounced](/reactivity/debounced) — Uses `MaybeSignal` for debounce timing
- [ElementSize](/elements/element-size) — Uses `MaybeElementSignal` for target elements

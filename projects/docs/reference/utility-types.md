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

## MaybeElementSignal&lt;Type&gt;

Union type for element references that can be an element, `ElementRef`, or a `Signal` containing either of these (including `null` or `undefined`).

```typescript
type MaybeElementSignal<T extends Element> =
  | T
  | ElementRef<T>
  | Signal<T | ElementRef<T> | null | undefined>;
```

> **Note:** The signal variant includes `null` and `undefined` because elements may dynamically change in reactive scenarios, particularly with conditional rendering where elements can appear or disappear based on signal values.

## UnrefElement&lt;Type&gt;

Extracts the element type from `ElementRef` or returns the type as-is.

```typescript
type UnrefElement<T> = T extends ElementRef<infer E> ? E : T;
```

## Related

- [Key Concepts](/guide/key-concepts) — Learn about Signal-First Design and common patterns
- [Debounced](/reactivity/debounced) — Uses `MaybeSignal` for debounce timing
- [ElementSize](/elements/element-size) — Uses `MaybeElementSignal` for target elements

---
source: https://github.com/signalityjs/signality/blob/main/projects/core/utilities/to-value.ts
---

# ToValue

Unwraps a [`MaybeSignal`](/reference/utility-types#maybesignal-lt-type-gt) value. If the input is a signal, it returns the signal's value; otherwise, it returns the input as-is.

This utility is useful when you need to handle both signal and non-signal values uniformly.

## Usage

```angular-ts
import { signal } from '@angular/core';
import { toValue } from '@signality/core';

const plainValue = 42;
const signalValue = signal(42);

toValue(plainValue);  // 42 // [!code highlight]
toValue(signalValue); // 42 // [!code highlight]
```

## With `untracked`

The `untracked` variant reads the signal's value without tracking it as a dependency in the current reactive context:

```angular-ts
import { effect, signal } from '@angular/core';
import { toValue } from '@signality/core';

const count = signal(0);

effect(() => {
  // This effect tracks count
  console.log('Tracked:', toValue(count));
});

effect(() => {
  // This effect does NOT track count
  console.log('Untracked:', toValue.untracked(count)); // [!code highlight]
});
```

## Type Definitions

```typescript
type MaybeSignal<T> = T | Signal<T>;

interface ToValueFn {
  <T>(maybeSignal: MaybeSignal<T>): T;
  untracked: <T>(maybeSignal: MaybeSignal<T>) => T;
}
```

## Related

- [ToElement](/utilities/to-element) — Similar utility for element references

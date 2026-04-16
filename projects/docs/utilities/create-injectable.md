---
source: https://github.com/signalityjs/signality/blob/main/projects/core/utilities/create-injectable.ts
---

# CreateInjectable

Creates a set of utility functions to manage Angular dependency injection in a typed and simplified way. It replaces traditional class-based services with a more functional and flexible approach.

## Usage

```angular-ts
import { signal } from '@angular/core';
import { createInjectable } from '@signality/core';

export const [injectCounter, provideCounter] = createInjectable( // [!code highlight]
  'Counter', // [!code highlight]
  (initialValue = 0) => { // [!code highlight]
    const count = signal(initialValue); // [!code highlight]
    const doubled = computed(() => count() * 2); // [!code highlight]
    // [!code highlight]

    function increment() { // [!code highlight]
      count.update((v) => v + 1); // [!code highlight]
    } // [!code highlight]
    // [!code highlight]

    return { count: count.asReadonly(), doubled, increment }; // [!code highlight]
  } // [!code highlight]
); // [!code highlight]

@Component({
  selector: 'app-counter',
  providers: [provideCounter(10)], // [!code highlight]
  template: `
    <p>Count: {{ counter.count() }}</p>
    <p>Doubled: {{ counter.doubled() }}</p>
    <button (click)="counter.increment()">Increment</button>
  `,
})
export class CounterComponent {
  readonly counter = injectCounter(); // [!code highlight]
}
```

## `createInjectable.root`

The `root` variant creates an injectable that is provided in the application root by default. This is ideal for global, tree-shakable singletons.

```angular-ts
import { signal, computed } from '@angular/core';
import { createInjectable } from '@signality/core';

export const [injectAuth] = createInjectable.root('Auth', () => { // [!code highlight]
  const user = signal<string | null>(null); // [!code highlight]
  const isLoggedIn = computed(() => Boolean(user())); // [!code highlight]
  // [!code highlight]

  return { user: user.asReadonly(), isLoggedIn }; // [!code highlight]
}); // [!code highlight]

@Component({ ... })
export class MyComponent {
  readonly auth = injectAuth(); // [!code highlight]
}
```

## Parameters

| Parameter     | Type       | Description                                                                     |
| ------------- | ---------- | ------------------------------------------------------------------------------- |
| `description` | `string`   | A descriptive label for the underlying `InjectionToken` (useful for debugging). |
| `factory`     | `Function` | A factory function that defines the injectable's logic.                         |

## Return Value

Returns a tuple containing:

| Index | Name             | Description                                                   |
| ----- | ---------------- | ------------------------------------------------------------- |
| `0`   | `injectFn`       | A function to retrieve the instance (equivalent to `inject`). |
| `1`   | `provideFn`      | A function to provide the injectable in a `providers` array.  |
| `2`   | `injectionToken` | The underlying Angular `InjectionToken`.                      |

## Examples

### Manual providing of root injectables

Even if an injectable is defined with `.root`, you can still provide it manually to override its value in a specific component tree (e.g., for testing or scoped configuration).

```angular-ts
const [injectConfig, provideConfig] = createInjectable.root( // [!code highlight]
  'Config', // [!code highlight]
  (apiUrl = 'https://api.example.com') => ({ apiUrl }) // [!code highlight]
); // [!code highlight]

@Component({
  providers: [
    provideConfig('https://staging-api.example.com') // [!code highlight]
  ],
})
export class StagingComponent {
  readonly config = injectConfig(); // Returns staging API URL [!code highlight]
}
```

### Using with custom Injector

The `injectFn` supports passing an explicit `Injector` if you need to inject the value outside of the typical injection context.

```angular-ts
import { inject, Injector } from '@angular/core';

export class ManualInjection {
  private injector = inject(Injector); // [!code ++]

  someMethod() {
    const counter = injectCounter({ injector: this.injector }); // [!code highlight]
  }
}
```

## Type Definitions

```typescript
export type CreateInjectableReturn<Arguments extends any[], InjectReturn> = Readonly<
  [
    injectFn: InjectFn<InjectReturn>,
    provideFn: ProvideFn<Arguments>,
    injectionToken: InjectionToken<InjectReturn>
  ]
>;

interface CreateInjectableFn {
  <Arguments extends any[], Return>(
    description: string,
    factory: Factory<Arguments, Return>
  ): CreateInjectableReturn<Arguments, Return>;

  root: <Arguments extends any[], Return>(
    description: string,
    factory: (...args: RootArguments<Arguments>) => Return
  ) => CreateInjectableReturn<RootArguments<Arguments>, Return>;
}
```


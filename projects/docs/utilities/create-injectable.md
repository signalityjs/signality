---
source: https://github.com/signalityjs/signality/blob/main/projects/core/utilities/create-injectable.ts
---

# CreateInjectable

Defines a typed factory function for creating injectable dependencies that return a tuple of injection utilities. Offers an alternative to class-based Angular services with functional, composable dependency factories.

## Usage

```angular-ts
import { Component, computed, signal } from '@angular/core';
import { createInjectable } from '@signality/core';

export const [injectCounter, provideCounter] = createInjectable( // [!code highlight]
  'Counter',
  (initialValue = 0) => {
    const count = signal(initialValue);
    const doubled = computed(() => count() * 2);

    function increment() {
      count.update(v => v + 1);
    }

    return { count: count.asReadonly(), doubled, increment };
  }
);

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

The `root` variant creates an injectable that is provided in the application root by default.

```angular-ts
import { computed, inject } from '@angular/core';
import { createInjectable } from '@signality/core';
import { AuthGateway } from './auth-gateway';

export const [injectAuth] = createInjectable.root('Auth', () => { // [!code highlight]
  const authGateway = inject(AuthGateway);

  const me = rxResource({ stream: () => authGateway.getUserMe() });

  const isAdmin = computed(() => {
    return me().hasValue() && me.value().roles.includes('admin');
  });

  return { userMe: me.asReadonly(), isAdmin };
});

```

## Parameters

| Parameter     | Type       | Description                                                                     |
|---------------|------------|---------------------------------------------------------------------------------|
| `description` | `string`   | A descriptive label for the underlying `InjectionToken` (useful for debugging). |
| `factory`     | `Function` | A factory function that defines the injectable's logic.                         |

## Return Value

Returns a tuple containing:

| Index | Name             | Description                                                   |
|-------|------------------|---------------------------------------------------------------|
| `0`   | `injectFn`       | A function to retrieve the instance (equivalent to `inject`). |
| `1`   | `provideFn`      | A function to provide the injectable in a `providers` array.  |
| `2`   | `injectionToken` | The underlying Angular `InjectionToken`.                      |

## Examples

### Manual providing of root injectables

Even if an injectable is defined with `.root`, you can still provide it manually to override its value in a specific component tree (e.g., for testing or scoped configuration).

```angular-ts
const [injectConfig, provideConfig] = createInjectable.root( // [!code highlight]
  'Config',
  (apiUrl = 'https://api.example.com') => ({ apiUrl }) //
);

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

```ts
export type CreateInjectableRef<Params extends any[], InjectReturn> = Readonly<
  [
    injectFn: InjectFn<InjectReturn>,
    provideFn: ProvideFn<Params>,
    injectionToken: InjectionToken<InjectReturn>
  ]
>;

interface CreateInjectableFn {
  <Factory extends Function>(description: string, factory: Factory): CreateInjectableRef<
    ExtractParams<Factory>,
    ExtractReturn<Factory>
  >;

  root: <Factory extends Function>(
    description: string,
    factory: Factory
  ) => HasRequiredParam<ExtractParams<Factory>> extends true
    ? never
    : CreateInjectableRef<ExtractParams<Factory>, ExtractReturn<Factory>>;
}
```

### Utility Types
```ts
export type ExtractParams<Factory> = Factory extends (...args: infer Params) => any
  ? Params
  : never;

export type ExtractReturn<Factory> = Factory extends (...args: any[]) => infer Return
  ? Return
  : never;

type HasRequiredParam<Params extends any[]> = Params extends []
  ? false
  : Params extends [infer First, ...infer Rest extends any[]]
  ? undefined extends First
    ? HasRequiredParam<Rest>
    : true
  : false;
```

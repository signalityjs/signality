---
source: https://github.com/signalityjs/signality/blob/main/projects/core/router/params/index.ts
---

# Params

Reactive wrapper around Angular Router's [route parameters](https://angular.dev/api/router/ActivatedRoute#params). Access route params as signals with full type-safety.

## Usage

```angular-ts
import { Component } from '@angular/core';
import { params } from '@signality/core';

@Component({
  template: `
    <h1>User: {{ routeParams().id }}</h1>
    <p>Slug: {{ routeParams().slug }}</p>
  `,
})
export class UserPage {
  readonly routeParams = params<{ id: string; slug: string }>(); // [!code highlight]
}
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `options` | `ParamsOptions<T>` | Optional configuration (see [Options](#options) below) |

## Options

The `ParamsOptions` extends [`CreateSignalOptions<T>`](https://angular.dev/api/core/CreateSignalOptions) and `WithInjector`:

| Option     | Type                      | Default | Description                                    |
|------------|---------------------------|---------|------------------------------------------------|
| `equal` | [`ValueEqualityFn<T>`](https://angular.dev/api/core/ValueEqualityFn) | - | Custom equality function ([see more](https://angular.dev/guide/signals#signal-equality-functions)) |
| `debugName` | `string` | - | Debug name for the signal (development only) |
| `injector` | [`Injector`](https://angular.dev/api/core/Injector) | - | Optional injector for DI context |

## Return Value

Returns a `Signal<T>` containing the current route parameters, where `T` is an object with string keys and values of any type (defaults to `Record<string, any>`).

## Examples

### Type-safe params

```angular-ts
import { Component } from '@angular/core';
import { params } from '@signality/core';

interface ProductParams {
  categoryId: string;
  productId: string;
}

@Component({
  template: `
    <p>Category: {{ routeParams().categoryId }}</p>
    <p>Product: {{ routeParams().productId }}</p>
  `,
})
export class ProductPage {
  readonly routeParams = params<ProductParams>(); // [!code highlight]
}
```

### Accessing individual params

```angular-ts
import { Component, computed } from '@angular/core';
import { params } from '@signality/core';

@Component({
  template: `
    <p>User ID: {{ userId() }}</p>
    <p>Action: {{ action() ?? 'view' }}</p>
  `,
})
export class UserDetail {
  readonly routeParams = params<{ id: string; action?: string }>();
  
  readonly userId = computed(() => this.routeParams().id); // [!code highlight]
  readonly action = computed(() => this.routeParams().action); // [!code highlight]
}
```

## SSR Compatibility

On the server, the signal initializes with the route params from the [snapshot](https://angular.dev/guide/routing/read-route-state#understanding-route-snapshots).

## Type Definitions

```typescript
type ParamsOptions<T extends Record<string, any> = Record<string, any>> = CreateSignalOptions<T> & WithInjector;

function params<T extends Record<string, any> = Record<string, any>>(options?: ParamsOptions<T>): Signal<T>;
```

## Related

- [queryParams](/router/query-params) — Access query parameters
- [fragment](/router/fragment) — Access URL fragment
- [url](/router/url) — Access current URL

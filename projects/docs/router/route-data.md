---
source: https://github.com/signalityjs/signality/blob/main/projects/core/router/route-data/index.ts
---

# RouteData

Reactive wrapper around Angular Router's [route data](https://angular.dev/api/router/ActivatedRoute#data). Access route data as signals with full type-safety.

## Usage

```angular-ts
import { Component } from '@angular/core';
import { routeData } from '@signality/core';

@Component({
  template: `
    <h1>{{ routeData().name }}</h1>
  `,
})
export class ProductPage {
  readonly routeData = routeData<{ name: string }>(); // [!code highlight]
}
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `options` | `RouteDataOptions<T>` | Optional configuration (see [Options](#options) below) |

## Options

The `RouteDataOptions` extends [`CreateSignalOptions<T>`](https://angular.dev/api/core/CreateSignalOptions) and `WithInjector`:

| Option     | Type                      | Default | Description                                    |
|------------|---------------------------|---------|------------------------------------------------|
| `equal` | [`ValueEqualityFn<T>`](https://angular.dev/api/core/ValueEqualityFn) | - | Custom equality function ([see more](https://angular.dev/guide/signals#signal-equality-functions)) |
| `debugName` | `string` | - | Debug name for the signal (development only) |
| `injector` | [`Injector`](https://angular.dev/api/core/Injector) | - | Optional injector for DI context |

## Return Value

Returns a `Signal<T>` containing the current route data, where `T` defaults to `unknown`.

## Examples

### Type-safe route data

```angular-ts
import { Component } from '@angular/core';
import { routeData } from '@signality/core';

interface ProductData {
  product: {
    id: number;
    name: string;
    price: number;
  };
  category?: string;
}

@Component({
  template: `
    <h1>{{ data().product.name }}</h1>
    <p>Price: ${{ data().product.price }}</p>
    <p>Category: {{ data().category ?? 'Uncategorized' }}</p>
  `,
})
export class ProductDetail {
  readonly data = routeData<ProductData>(); // [!code highlight]
}
```

### With route [resolver](https://angular.dev/guide/routing/data-resolvers)

```angular-ts
import { Component, computed, inject } from '@angular/core';
import { routeData } from '@signality/core';
import { UserService } from './user.service';

// Route resolver
export const userResolver: ResolveFn<User> = (route, state) => {
  const userService = inject(UserService);
  return userService.getUser(route.params['id']);
};

// Route configuration
export const routes: Routes = [
  {
    path: 'user/:id',
    component: UserProfile,
    resolve: { user: userResolver }, // [!code highlight]
  },
];

// Component
@Component({
  template: `
    @if (user(); as user) {
      <h1>{{ user.name }}</h1>
      <p>{{ user.email }}</p>
    }
  `,
})
export class UserProfile {
  readonly routeData = routeData<{ user: User }>();
  readonly user = computed(() => this.routeData().user); // [!code highlight]
}
```

### Static route data

```angular-ts
import { Component } from '@angular/core';
import { routeData } from '@signality/core';

// Route configuration
export const routes: Routes = [
  {
    path: 'about',
    component: AboutPage,
    data: { showBreadcrumbs: true }, // [!code highlight]
  },
];

// Component
@Component({
  template: `
    @if (pageData().showBreadcrumbs) {
      <nav>...</nav>
    }
  `,
})
export class AboutPage {
  readonly pageData = routeData<{ showBreadcrumbs: boolean }>(); // [!code highlight]
}
```

## SSR Compatibility

On the server, the signal initializes with the route data from the [snapshot](https://angular.dev/guide/routing/read-route-state#understanding-route-snapshots).

## Type Definitions

```typescript
type RouteDataOptions<T = unknown> = CreateSignalOptions<T> & WithInjector;

function routeData<T = unknown>(options?: RouteDataOptions<T>): Signal<T>;
```

## Related

- [params](/router/params) — Access route parameters
- [queryParams](/router/query-params) — Access query parameters
- [fragment](/router/fragment) — Access URL fragment
- [url](/router/url) — Access current URL

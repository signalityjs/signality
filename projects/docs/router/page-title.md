---
source: https://github.com/signalityjs/signality/blob/main/projects/core/router/page-title/index.ts
---

# PageTitle

Reactive wrapper around Angular Router's [route title](https://angular.dev/api/router/ActivatedRoute#title). Access the resolved route title as a writable signal that can be set to update the page title.

## Usage

```angular-ts
import { Component } from '@angular/core';
import { pageTitle } from '@signality/core';

@Component({
  template: `
    <h1>{{ title() ?? 'Default Title' }}</h1>
  `,
})
export class ProductPage {
  readonly title = pageTitle(); // [!code highlight]
}
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `options` | `PageTitleOptions` | Optional configuration (see [Options](#options) below) |

## Options

The `PageTitleOptions` extends [`CreateSignalOptions<string>`](https://angular.dev/api/core/CreateSignalOptions) and `WithInjector`:

| Option     | Type      | Default | Description                                    |
|------------|-----------|---------|------------------------------------------------|
| `equal` | [`ValueEqualityFn<string>`](https://angular.dev/api/core/ValueEqualityFn) | - | Custom equality function ([see more](https://angular.dev/guide/signals#signal-equality-functions)) |
| `debugName` | `string` | - | Debug name for the signal (development only) |
| `injector` | [`Injector`](https://angular.dev/api/core/Injector) | - | Optional injector for DI context |

## Return Value

Returns a `WritableSignal<string>` containing the current route title. The signal can be updated using `set()` or `update()` methods, which will also update the page title via Angular's [Title service](https://angular.dev/api/platform-browser/Title).

## Examples

### Display route title

```angular-ts
import { Component } from '@angular/core';
import { pageTitle } from '@signality/core';

@Component({
  template: `
    <header>
      <h1>{{ title() ?? 'My App' }}</h1>
    </header>
    <router-outlet />
  `,
})
export class App {
  readonly title = pageTitle(); // [!code highlight]
}
```

### Title from [resolver](https://angular.dev/guide/routing/define-routes#page-titles)

```angular-ts
import { Component } from '@angular/core';
import { pageTitle } from '@signality/core';

// Route configuration:
// {
//   path: 'product/:id',
//   component: ProductPage,
//   title: route => `Product ${route.params['id']}`
// }

@Component({
  template: `
    <h1>{{ title() }}</h1>
  `,
})
export class ProductPage {
  readonly title = pageTitle(); // Will be "Product 123" for /product/123
}
```

### Updating title

```angular-ts
import { Component, effect, inject } from '@angular/core';
import { pageTitle } from '@signality/core';
import { MessagesStore } from './messages';

@Component({ /* ... */ })
export class MessagesPage {
  readonly title = pageTitle();
  readonly messages = inject(MessagesStore);

  constructor() {
    effect(() => {
      const count = this.messages.unreadCount();
      this.title.set(count > 0 ? `(${count}) Messages` : 'Messages'); // [!code highlight]
    });
  }
}
```

## SSR Compatibility

On the server, the signal initializes with the title from the [snapshot](https://angular.dev/guide/routing/read-route-state#understanding-route-snapshots).

## Type Definitions

```typescript
type PageTitleOptions = CreateSignalOptions<string> & WithInjector;

function pageTitle(options?: PageTitleOptions): WritableSignal<string>;
```

## Related

- [params](/router/params) — Access route parameters
- [queryParams](/router/query-params) — Access query parameters
- [fragment](/router/fragment) — Access URL fragment
- [url](/router/url) — Access current URL
- [routeData](/router/route-data) — Access route data

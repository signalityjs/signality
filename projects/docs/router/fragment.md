---
source: https://github.com/signalityjs/signality/blob/main/projects/core/router/fragment/index.ts
---

# Fragment

Reactive wrapper around Angular Router's [URL fragment](https://angular.dev/api/router/ActivatedRoute#fragment). Access the hash fragment as a signal.

## Usage

```angular-ts
import { Component } from '@angular/core';
import { fragment } from '@signality/core';

@Component({
  template: `
    <nav>
      <a href="#overview">Overview</a>
      <a href="#details">Details</a>
      <a href="#reviews">Reviews</a>
    </nav>
    <p>Current section: {{ fragment() ?? 'none' }}</p>
  `,
})
export class ProductPage {
  readonly fragment = fragment(); // [!code highlight]
}
```

## Parameters

| Parameter | Type              | Description                                            |
|-----------|-------------------|--------------------------------------------------------|
| `options` | `FragmentOptions` | Optional configuration (see [Options](#options) below) |

## Options

The `FragmentOptions` extends [`CreateSignalOptions<string | null>`](https://angular.dev/api/core/CreateSignalOptions) and `WithInjector`:

| Option      | Type                                                                              | Default | Description                                                                                        |
|-------------|-----------------------------------------------------------------------------------|---------|----------------------------------------------------------------------------------------------------|
| `equal`     | [`ValueEqualityFn<string \| null>`](https://angular.dev/api/core/ValueEqualityFn) | -       | Custom equality function ([see more](https://angular.dev/guide/signals#signal-equality-functions)) |
| `debugName` | `string`                                                                          | -       | Debug name for the signal (development only)                                                       |
| `injector`  | [`Injector`](https://angular.dev/api/core/Injector)                               | -       | Optional injector for DI context                                                                   |

## Return Value

Returns a `Signal<string | null>` containing the current URL fragment (without the `#`), or `null` if no fragment exists.

## SSR Compatibility

On the server, the signal initializes with the fragment from the [snapshot](https://angular.dev/guide/routing/read-route-state#understanding-route-snapshots).

## Type Definitions

```typescript
type FragmentOptions = CreateSignalOptions<string | null> & WithInjector;

function fragment(options?: FragmentOptions): Signal<string | null>;
```

## Related

- [params](/router/params) — Access route parameters
- [queryParams](/router/query-params) — Access query parameters
- [url](/router/url) — Access current URL

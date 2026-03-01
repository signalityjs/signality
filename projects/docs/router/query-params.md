---
source: https://github.com/signalityjs/signality/blob/main/projects/core/router/query-params/index.ts
---

# QueryParams

Reactive wrapper around Angular Router's [query parameters](https://angular.dev/api/router/ActivatedRoute#queryParams). Access query parameters as signals with full type-safety. Optionally validate parameters at runtime using schema validators for type checking, type coercion, and error handling.

## Usage

### Basic usage

```angular-ts
import { Component } from '@angular/core';
import { queryParams } from '@signality/core';

@Component({
  template: `
    <p>Search: {{ queryParams().q }}</p>
    <p>Sort: {{ queryParams().sort }}</p>
  `,
})
export class SearchPage {
  readonly queryParams = queryParams<{ q: string; sort: string }>(); // [!code highlight]
}
```

### With schema validation

```angular-ts
import { Component } from '@angular/core';
import { queryParams } from '@signality/core';
import { z } from 'zod'; // [!code ++]

const schema = z.object({
  q: z.string().optional(),
  page: z.coerce.number().default(1),
});

@Component({
  template: `
    <p>Search: {{ params.value().q }}</p>
    <p>Page: {{ params.value().page }}</p>
  `,
})
export class SearchPage {
  readonly params = queryParams({ schema }); // [!code highlight]
}
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `options` | `QueryParamsOptions<T>` \| `QueryParamsWithSchemaOptions<T>` | Optional configuration (see [Options](#options) below). When `schema` is provided, enables validation and returns `QueryParamsRef<T>`. |

## Options

The options object extends [`CreateSignalOptions<T>`](https://angular.dev/api/core/CreateSignalOptions) and `WithInjector`:

| Option     | Type                      | Default | Description                                    |
|------------|---------------------------|---------|------------------------------------------------|
| `equal` | [`ValueEqualityFn<T>`](https://angular.dev/api/core/ValueEqualityFn) | - | Custom equality function ([see more](https://angular.dev/guide/signals#signal-equality-functions)) |
| `debugName` | `string` | - | Debug name for the signal (development only) |
| `schema` | `QueryParamsValidator<T>` | - | **Optional.** Validator schema for runtime validation. When provided, returns `QueryParamsRef<T>` instead of `Signal<T>`. See [Schema validation](#schema-validation) for details. |
| `injector` | [`Injector`](https://angular.dev/api/core/Injector) | - | Optional injector for DI context |

## Return Value

The return type depends on whether a `schema` is provided:

### Without schema

Returns `Signal<T>` containing the current query parameters, where `T` is an object with string keys and values of any type (defaults to `Record<string, any>`).

### With schema

Returns `QueryParamsRef<T>` — an object with the following properties:

| Property | Type | Description |
|----------|------|-------------|
| `value` | `Signal<T>` | Signal containing validated and transformed query parameters. **Reading this signal throws an error if validation failed.** Use `isValid()` to check before reading. |
| `isValid` | `Signal<boolean>` | Signal indicating whether the current query parameters are valid according to the schema. `true` when valid, `false` when validation fails. |
| `error` | `Signal<unknown \| null>` | Signal containing the validation error object, or `null` if the parameters are valid. |

## Examples

### Accessing individual query params

```angular-ts
import { Component, computed } from '@angular/core';
import { queryParams } from '@signality/core';

@Component({ /* ... */ })
export class SearchResults {
  readonly queryParams = queryParams<{ q?: string; page?: string }>();
  
  readonly search = computed(() => this.queryParams().q ?? ''); // [!code highlight]
  readonly page = computed(() => Number(this.queryParams().page ?? '1')); // [!code highlight]
}
```

### Schema validation

Validate query parameters at runtime using schema validators like [Zod](https://zod.dev). When a schema is provided, `queryParams` returns a `QueryParamsRef` object with validation status and error information.

::: warning Reading value() in error state
Reading the `value()` signal on a `QueryParamsRef` that is in an error state throws at runtime. It is recommended to guard `value()` reads with `isValid()`.

```angular-ts
if (params.isValid()) {
  // Safe to read params.value()
  const data = params.value();
}
```

:::

```angular-ts
import { Component, effect, signal } from '@angular/core';
import { queryParams } from '@signality/core';
import { z } from 'zod';

const searchSchema = z.object({
  q: z.string().min(1).optional(),
  page: z.coerce.number().int().positive().default(1),
});

@Component({ /* ... */ })
export class SearchPage {
  readonly params = queryParams({ schema: searchSchema });

  constructor() {
    effect(() => {
      if (this.params.isValid()) { // [!code highlight]
        const { q, page } = this.params.value(); // [!code highlight]
        this.searchProducts(q, page); // [!code highlight]
      } // [!code highlight]
    });
  }

  async searchProducts(q?: string, page = 1) {
    // API call implementation
  }
}
```

#### Custom validators

You can use any validator that implements the `QueryParamsValidator` interface:

```typescript
interface QueryParamsValidator<T> {
  parse(data: unknown): T;
}
```

```angular-ts
const pageSchema = {
  parse(data: unknown): { page: string } {
    const params = data as { page?: string };
    const page = Number(params.page);
    if (isNaN(page) || page < 1) {
      throw new Error('Page must be a positive number');
    }
    return { page };
  },
};
```

## SSR Compatibility

On the server, the signal initializes with the query params from the [snapshot](https://angular.dev/guide/routing/read-route-state#understanding-route-snapshots).

## Type Definitions

```typescript
interface QueryParamsValidator<T> {
  parse(data: unknown): T;
}

interface QueryParamsRef<T> {
  readonly value: Signal<T>;
  readonly isValid: Signal<boolean>;
  readonly error: Signal<unknown | null>;
}

type QueryParamsOptions<T extends Record<string, any> = Record<string, any>> = CreateSignalOptions<T> & WithInjector;

type QueryParamsWithSchemaOptions<T extends Record<string, any> = Record<string, any>> = QueryParamsOptions<T> & {
  readonly schema: QueryParamsValidator<T>;
};

// Without schema - returns Signal<T>
function queryParams<T extends Record<string, any> = Record<string, any>>(options?: QueryParamsOptions<T>): Signal<T>;

// With schema - returns QueryParamsRef<T>
function queryParams<T extends Record<string, any> = Record<string, any>>(
  options: QueryParamsWithSchemaOptions<T>
): QueryParamsRef<T>;
```

## Related

- [params](/router/params) — Access route parameters
- [fragment](/router/fragment) — Access URL fragment
- [url](/router/url) — Access current URL

---
source: https://github.com/signalityjs/signality/blob/main/projects/core/router/query-params/index.ts
---

# QueryParams

Reactive wrapper around Angular Router's [query parameters](https://angular.dev/api/router/ActivatedRoute#queryParams). Optionally validate parameters at runtime using schema validators for type checking, type coercion, and error handling.

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

### <svg xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle; margin-right: 5px; margin-bottom: 2px" width="21px" height="21px" viewBox="0 0 16 16" fill="none"><path d="M1.72205 2.38834C1.8274 2.09951 2.01897 1.85002 2.27081 1.67366C2.52265 1.4973 2.8226 1.40259 3.13005 1.40234H12.8747C13.5067 1.40234 14.0707 1.79901 14.2847 2.39368L15.9114 6.91168C16.0126 7.19365 16.0271 7.49948 15.953 7.78976C15.8788 8.08003 15.7194 8.34146 15.4954 8.54034L9.08872 14.2203C8.81675 14.4612 8.4666 14.5952 8.1033 14.5974C7.74001 14.5996 7.38826 14.4699 7.11338 14.2323L0.516718 8.51568C0.287641 8.31683 0.124236 8.0532 0.0480631 7.75958C-0.0281096 7.46596 -0.0134696 7.15614 0.0900512 6.87101L1.72205 2.38834ZM9.74738 5.64634L3.67405 9.33768L7.50072 12.6757C7.64797 12.8042 7.83701 12.8747 8.03247 12.874C8.22794 12.8732 8.41644 12.8013 8.56272 12.6717L12.3247 9.33768H9.59938L13.7587 6.69968C14.0841 6.48101 14.2187 6.06834 14.086 5.69968L13.2594 3.40234C13.1876 3.20292 13.0556 3.03071 12.8818 2.9095C12.7079 2.78829 12.5007 2.72406 12.2887 2.72568H3.69605C3.48735 2.72723 3.2841 2.79257 3.11359 2.91292C2.94307 3.03327 2.81343 3.20288 2.74205 3.39901L1.92338 5.64568L9.74738 5.64634Z" fill="#3E83FF"/></svg> With schema validation

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

| Parameter | Type                                                         | Description                                                                                                                            |
|-----------|--------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------|
| `options` | `QueryParamsOptions<T>` \| `QueryParamsWithSchemaOptions<T>` | Optional configuration (see [Options](#options) below). When `schema` is provided, enables validation and returns `QueryParamsRef<T>`. |

## Options

The options object extends [`CreateSignalOptions<T>`](https://angular.dev/api/core/CreateSignalOptions) and `WithInjector`:

| Option      | Type                                                                 | Default | Description                                                                                                                                                                        |
|-------------|----------------------------------------------------------------------|---------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `equal`     | [`ValueEqualityFn<T>`](https://angular.dev/api/core/ValueEqualityFn) | -       | Custom equality function ([see more](https://angular.dev/guide/signals#signal-equality-functions))                                                                                 |
| `debugName` | `string`                                                             | -       | Debug name for the signal (development only)                                                                                                                                       |
| `schema`    | `QueryParamsValidator<T>`                                            | -       | **Optional.** Validator schema for runtime validation. When provided, returns `QueryParamsRef<T>` instead of `Signal<T>`. See [Schema validation](#schema-validation) for details. |
| `injector`  | [`Injector`](https://angular.dev/api/core/Injector)                  | -       | Optional injector for DI context                                                                                                                                                   |

## Return Value

The return type depends on whether a `schema` is provided:

### Without schema

Returns `Signal<T>` containing the current query parameters, where `T` is an object with string keys and values of any type (defaults to `Record<string, any>`).

### With schema

Returns `QueryParamsRef<T>` — an object with the following properties:

| Property  | Type                      | Description                                                                                                                                                          |
|-----------|---------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `value`   | `Signal<T>`               | Signal containing validated and transformed query parameters. **Reading this signal throws an error if validation failed.** Use `isValid()` to check before reading. |
| `isValid` | `Signal<boolean>`         | Signal indicating whether the current query parameters are valid according to the schema. `true` when valid, `false` when validation fails.                          |
| `error`   | `Signal<unknown \| null>` | Signal containing the validation error object, or `null` if the parameters are valid.                                                                                |

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
      if (this.params.isValid()) { // [!code warning]
        const { q, page } = this.params.value(); // [!code warning]
        this.searchProducts(q, page); // [!code warning]
      } // [!code warning]
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

function queryParams<T extends Record<string, any> = Record<string, any>>(options?: QueryParamsOptions<T>): Signal<T>;

function queryParams<T extends Record<string, any> = Record<string, any>>(
  options: QueryParamsWithSchemaOptions<T>
): QueryParamsRef<T>;
```

## Related

- [params](/router/params) — Access route parameters
- [fragment](/router/fragment) — Access URL fragment
- [url](/router/url) — Access current URL

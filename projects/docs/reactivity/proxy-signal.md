---
source: https://github.com/signalityjs/signality/blob/main/projects/core/reactivity/proxy-signal/index.ts
---

# ProxySignal

Creates a wrapper around a signal that intercepts get and set operations.

## Usage

Provides explicit control over signal get (dependency tracking) and set (update triggering) operations, while preserving the standard [WritableSignal](https://angular.dev/api/core/WritableSignal) or [Signal](https://angular.dev/api/core/Signal) interface.

Update logic customization enables you to define custom behavior for `set()` or `update()` calls on the created signal. For instance, this can be used for scheduler configuration:

```angular-ts
import { signal } from '@angular/core';
import { proxySignal } from '@signality/core';

function debouncedSignal<T>(initialValue: T, ms: number): WritableSignal<T> {
  const source = signal(initialValue);
  let timeoutId: ReturnType<typeof setTimeout>;

  return proxySignal(source, {
    set: (value, source) => { // [!code highlight]
      clearTimeout(timeoutId);  // [!code highlight]
      timeoutId = setTimeout(() => source.set(value), ms); // [!code highlight]
    } // [!code highlight]
  });
}
```

Now you can use `debouncedSignal` to create signals with delayed updates:

```angular-ts
const search = debouncedSignal('', 300);
search.set('query'); // actual update happens after 300ms of inactivity // [!code highlight]
```

::: tip Note
Signality uses `proxySignal` internally in utilities like [Debounced](/reactivity/debounced) and [Throttled](/reactivity/throttled) to implement scheduling behavior.
:::

## Parameters

| Parameter | Type                                    | Description                                            |
|-----------|-----------------------------------------|--------------------------------------------------------|
| `source`  | `Signal<T>` or `WritableSignal<T>`      | Source signal to wrap                                  |
| `handler` | `ProxySignalHandler<T, R>`              | Handler with optional get/set transformations          |
| `options` | `Pick<CreateSignalOptions<R>, 'equal'>` | Optional configuration (see [Options](#options) below) |

## Options

::: warning `equal` applies to the proxy handler, not the source signal
The `equal` option **does not** propagate to the original source signal. It is used exclusively by the proxy's `set` and `update` methods to compare **transformed values** — that is, the result of calling `handler.get` on the current source value.

By default, `Object.is` is used.
:::

| Option  | Type                                                                 | Description              |
|---------|----------------------------------------------------------------------|--------------------------|
| `equal` | [`ValueEqualityFn<T>`](https://angular.dev/api/core/ValueEqualityFn) | Custom equality function |

## Return Value

- When passed a **writable signal** → returns `WritableSignal<T>`
- When passed a **readonly signal** → returns `Signal<T>`

## Examples

### Type transformation

Use `get` + `set` together for bidirectional transformation:

```angular-ts
import { signal } from '@angular/core';
import { proxySignal } from '@signality/core';

const source = signal('a,b,c');
const proxy = proxySignal(source, {
  get: s => s().split(','), // string → string[] // [!code highlight]
  set: (v, s) => s.set(v.join(',')) // string[] → string // [!code highlight]
});

proxy(); // ['a', 'b', 'c']
proxy.set(['x', 'y']); // source becomes 'x,y'
proxy(); // ['x', 'y']
```

## Type Definitions

```typescript
export type ProxySignalHandler<T, R = T> =
  | { readonly get: (source: Signal<T>) => R; readonly set: (value: R, source: WritableSignal<T>) => void }
  | { readonly get: (source: Signal<T>) => T; readonly set?: (value: T, source: WritableSignal<T>) => void }
  | { readonly get?: never; readonly set: (value: T, source: WritableSignal<T>) => void }
  | { readonly get: (source: Signal<T>) => R; readonly set?: never }
  | { readonly get?: never; readonly set?: never };

function proxySignal<T, R>(
  source: WritableSignal<T>,
  handler: { get: (source: Signal<T>) => R; set: (value: R, source: WritableSignal<T>) => void },
  options?: Pick<CreateSignalOptions<R>, 'equal'>
): WritableSignal<R>;

function proxySignal<T>(
  source: WritableSignal<T>,
  handler: { get: (source: Signal<T>) => T; set?: (value: T, source: WritableSignal<T>) => void },
  options?: Pick<CreateSignalOptions<T>, 'equal'>
): WritableSignal<T>;

function proxySignal<T, R>(
  source: Signal<T>,
  handler: { get: (source: Signal<T>) => R; set?: never },
  options?: Pick<CreateSignalOptions<R>, 'equal'>
): Signal<R>;

function proxySignal<T>(
  source: WritableSignal<T>,
  handler: { get?: never; set: (value: T, source: WritableSignal<T>) => void },
  options?: Pick<CreateSignalOptions<T>, 'equal'>
): WritableSignal<T>;

function proxySignal<T>(
  source: WritableSignal<T>,
  handler: { get?: never; set?: never },
  options?: Pick<CreateSignalOptions<T>, 'equal'>
): WritableSignal<T>;

function proxySignal<T>(
  source: Signal<T>,
  handler: { get?: never; set?: never },
  options?: Pick<CreateSignalOptions<T>, 'equal'>
): Signal<T>;
```

## Related

- [Debounced](/reactivity/debounced) — Uses proxySignal internally
- [Throttled](/reactivity/throttled) — Uses proxySignal internally

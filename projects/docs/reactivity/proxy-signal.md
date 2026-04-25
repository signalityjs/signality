---
source: https://github.com/signalityjs/signality/blob/main/projects/core/reactivity/proxy-signal/index.ts
---

# ProxySignal

Creates a proxy wrapper around a signal that intercepts get and set operations, enabling bidirectional value transformations.

## Usage

### Custom scheduling

Intercept `set` calls to add custom behavior — debounce, throttle, validation, etc.:

```angular-ts
import { signal } from '@angular/core';
import { debounceCallback, proxySignal } from '@signality/core';

function debounced<T>(initialValue: T, timeMs: number) {
  const source = signal(initialValue);
  const set = debounceCallback(source.set, timeMs);
  return proxySignal(source, { set });
}

const search = debounced('', 300);
search.set('query'); // actual update happens after 300ms of inactivity
```

### Type transformation

Use `get` + `set` together for bidirectional transformation:

```angular-ts
import { signal } from '@angular/core';
import { proxySignal } from '@signality/core';

const source = signal('a,b,c');
const proxy = proxySignal(source, {
  get: s => s().split(','),      // string → string[]
  set: (v, s) => s.set(v.join(',')) // string[] → string
});

proxy();              // ['a', 'b', 'c']
proxy.set(['x', 'y']);// source becomes 'x,y'
proxy();              // ['x', 'y']
```



## Parameters

| Parameter | Type                                    | Description                                        |
|-----------|-----------------------------------------|----------------------------------------------------|
| `source`  | `Signal<T>` or `WritableSignal<T>`      | Source signal to wrap                              |
| `handler` | `ProxySignalHandler<T, R>`              | Handler with optional get/set transformations      |
| `options` | `Pick<CreateSignalOptions<R>, 'equal'>` | Optional equality function (for transformed value) |

## Options

::: warning `equal` applies to the proxy handler, not the source signal
The `equal` option **does not** propagate to the original source signal. It is used exclusively by the proxy's `set` and `update` methods to compare **transformed values** — that is, the result of calling `handler.get` on the current source value.

By default, `Object.is` is used (the source signal's own `equal` option is ignored).
:::

| Option  | Type                                                                 | Description                                          |
|---------|----------------------------------------------------------------------|------------------------------------------------------|
| `equal` | [`ValueEqualityFn<T>`](https://angular.dev/api/core/ValueEqualityFn) | Custom equality function to skip unnecessary updates |

## Return Value

- When passed a **writable signal** → returns `WritableSignal<T>` with proxy behavior
- When passed a **readonly signal** → returns `Signal<T>` (readonly)

## Examples

### Type transformation

Transform between different representations on read and write:

```angular-ts
import { signal } from '@angular/core';
import { proxySignal } from '@signality/core';

const source = signal('a,b,c');
const proxy = proxySignal(source, {
  get: s => s().split(','),   // string → string[]
  set: (v, s) => s.set(v.join(','))  // string[] → string
});

proxy();              // ['a', 'b', 'c']
proxy.set(['x', 'y']);// source becomes 'x,y'
proxy();              // ['x', 'y']
```

### Custom debounced signal

Build a debounced signal using `proxySignal` and `debounceCallback`:

```angular-ts
import { signal } from '@angular/core';
import { debounceCallback, proxySignal } from '@signality/core';

function myDebounced<T>(initialValue: T, timeMs: number) {
  const source = signal(initialValue);
  const set = debounceCallback(source.set, timeMs);
  return proxySignal(source, { set });
}

const debouncedValue = myDebounced('', 300);

debouncedValue.set('hello');
// ...after 300ms of inactivity...
// output signal is updated
```

## Type Definitions

```typescript
export type ProxySignalHandler<T, R = T> =
  | { get: (source: Signal<T>) => R; set?: (value: R, source: WritableSignal<T>) => void }
  | { get?: never; set?: (value: R, source: WritableSignal<T>) => void };

function proxySignal<T, R>(
  source: WritableSignal<T>,
  handler: { get: (source: Signal<T>) => R; set?: (value: R, source: WritableSignal<T>) => void },
  options?: Pick<CreateSignalOptions<R>, 'equal'>
): WritableSignal<R>;

function proxySignal<T, R>(
  source: Signal<T>,
  handler: { get: (source: Signal<T>) => R; set?: never },
  options?: Pick<CreateSignalOptions<R>, 'equal'>
): Signal<R>;

function proxySignal<T>(
  source: WritableSignal<T>,
  handler: { get?: never; set?: (value: T, source: WritableSignal<T>) => void },
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

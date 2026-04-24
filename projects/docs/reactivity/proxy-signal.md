---
source: https://github.com/signalityjs/signality/blob/main/projects/core/reactivity/proxy-signal/index.ts
---

# ProxySignal

Creates a proxy wrapper around a signal that intercepts get and set operations.

## Usage

### Get handler

Transform values when reading from a signal:

```angular-ts
import { signal } from '@angular/core';
import { proxySignal } from '@signality/core';

const source = signal(1);
const proxy = proxySignal(source, {
  get: s => s() * 2  // transform on read: 1 → 2, 5 → 10
});

source.set(5);
proxy();        // 10
```

### Set handler

Transform values when writing to a signal:

```angular-ts
import { signal } from '@angular/core';
import { proxySignal } from '@signality/core';

const source = signal(0);
const proxy = proxySignal(source, {
  set: (v, s) => s.set(v * 2)  // transform on write: 3 → source becomes 6
});

proxy.set(3);
source();       // 6
```

### Get + Set handlers

Combine both for bidirectional transformations:

```angular-ts
import { signal } from '@angular/core';
import { proxySignal } from '@signality/core';

const source = signal('  hello  ');
const proxy = proxySignal(source, {
  get: s => s().trim(),       // external: "  hello  " → "hello"
  set: (v, s) => s.set(v)     // no transform on write
});

source();       // "  hello  "
proxy();        // "hello" (trimmed on read)

proxy.set(' world ');
source();       // " world " (stored as-is)
proxy();        // "world" (trimmed on read)
```

## Parameters

| Parameter | Type                                    | Description                                   |
|-----------|-----------------------------------------|-----------------------------------------------|
| `source`  | `Signal<T>` or `WritableSignal<T>`      | Source signal to wrap                         |
| `handler` | `SignalProxyHandler<T>`                 | Handler with optional get/set transformations |
| `options` | `Pick<CreateSignalOptions<T>, 'equal'>` | Optional equality function                    |

## Handler Interface

The `SignalProxyHandler<T>` interface defines the transformation hooks:

| Property | Type                                            | Description                                       |
|----------|-------------------------------------------------|---------------------------------------------------|
| `get`    | `(source: Signal<T>) => T`                      | Transforms value on read. Receives source signal. |
| `set`    | `(value: T, source: WritableSignal<T>) => void` | Transforms value on write.                        |

## Options

| Option  | Type                                                                 | Description                                          |
|---------|----------------------------------------------------------------------|------------------------------------------------------|
| `equal` | [`ValueEqualityFn<T>`](https://angular.dev/api/core/ValueEqualityFn) | Custom equality function to skip unnecessary updates |

## Return Value

- When passed a **writable signal** → returns `WritableSignal<T>` with proxy behavior
- When passed a **readonly signal** → returns `Signal<T>` (readonly)

## Examples

@TODO

## Type Definitions

```typescript
interface SignalProxyHandler<T> {
  get?(source: Signal<T>): T;
  set?(value: T, source: WritableSignal<T>): void;
}

// Overload 1: Writable signal (get + set allowed)
function proxySignal<T>(
  source: WritableSignal<T>,
  handler: SignalProxyHandler<T>,
  options?: Pick<CreateSignalOptions<T>, 'equal'>
): WritableSignal<T>;

// Overload 2: Readonly signal (get only)
function proxySignal<T>(
  source: Signal<T>,
  handler: Omit<SignalProxyHandler<T>, 'set'>
): Signal<T>;
```

## Related

- [Debounced](/reactivity/debounced) — Uses proxySignal internally
- [Throttled](/reactivity/throttled) — Uses proxySignal internally

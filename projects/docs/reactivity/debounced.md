---
source: https://github.com/signalityjs/signality/blob/main/projects/core/reactivity/debounced/index.ts
---

# Debounced

Creates a debounced signal that delays value updates until a specified time has passed without changes.

<Demo name="debounced" />

## Usage

### Writable signal

Creates a new writable signal where both `set()` and `update()` calls are debounced:

```angular-ts
import { Component, effect } from '@angular/core';
import { debounced } from '@signality/core';

@Component({
  template: `
    <input [(ngModel)]="value" />
  `,
})
export class DebouncedInput {
  readonly value = debounced('', 300); // [!code highlight]

  constructor() {
    effect(() => {
      console.log('Debounced:', this.value());
    });
  }
}
```

### Computed signal

Wraps an existing signal with debounced behavior, returning a readonly signal:

```angular-ts
import { Component, signal, effect } from '@angular/core';
import { debounced } from '@signality/core';

@Component({ /* ... */ })
export class MyComponent {
  readonly rawValue = signal('');
  readonly debouncedValue = debounced(this.rawValue, 300); // [!code highlight]

  constructor() {
    effect(() => {
      console.log('Debounced:', this.debouncedValue());
    });
  }
}
```

## Parameters

| Parameter | Type                  | Description                                                     |
|-----------|-----------------------|-----------------------------------------------------------------|
| `source`  | `Signal<T>` or `T`    | Source signal to debounce, or initial value for writable signal |
| `timeMs`  | [`MaybeSignal<number>`](/reference/utility-types#maybesignal-lt-type-gt) | Debounce delay in milliseconds                |
| `options` | `DebouncedOptions<T>` | Optional configuration (see [Options](#options) below)          |

## Options

The `DebouncedOptions<T>` extends [`CreateSignalOptions<T>`](https://angular.dev/api/core/CreateSignalOptions) and `WithInjector`:

| Option      | Type                 | Description                                                                                                            |
|-------------|----------------------|------------------------------------------------------------------------------------------------------------------------|
| `equal`     | [`ValueEqualityFn<T>`](https://angular.dev/api/core/ValueEqualityFn) | Custom equality function ([see more](https://angular.dev/guide/signals#signal-equality-functions)) |
| `debugName` | `string`             | Debug name for the signal (development only)                                                                           |
| `injector`  | [`Injector`](https://angular.dev/api/core/Injector)           | Optional injector for DI context                                                                                       |

## Return Value

- When passed a **signal** → returns `Signal<T>` (readonly)
- When passed a **value** → returns `WritableSignal<T>`

## Examples

### Search with API Call

```angular-ts
import { Component } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { debounced } from '@signality/core';

@Component({
  template: `
    <input 
      placeholder="Search..." 
      (input)="query.set($event.target.value)" 
    />
    <ul>
      @if (resource.value(); as results) {
        @for (result of results; track result.id) {
          <li>{{ result.name }}</li>
        }
      }
    </ul>
  `,
})
export class SearchComponent {
  readonly query = debounced('', 400);
  readonly resource = httpResource(() => `/api/search?q=${this.query()}`);
}
```

### Dynamic delay

The delay can be a signal, allowing runtime changes:

```angular-ts
import { Component, signal } from '@angular/core';
import { debounced } from '@signality/core';

@Component({
  template: `
    <input (input)="value.set($event.target.value)" />
    <label>
      <input 
        type="checkbox" 
        (change)="fastMode.set($any($event.target).checked)" 
      />
      Fast mode
    </label>
  `,
})
export class DynamicDelayComponent {
  readonly fastMode = signal(false);
  readonly delay = computed(() => this.fastMode() ? 100 : 500); // [!code highlight]
  readonly value = debounced('', this.delay); // [!code highlight]
}
```

## SSR Compatibility

Debounce timers are not started on the server — the initial value is returned immediately.

## Type Definitions

```typescript
type DebouncedOptions<T> = CreateSignalOptions<T> & WithInjector;

// Overload 1: Computed from signal (readonly)
function debounced<S extends Signal<any>>(
  source: S,
  timeMs: MaybeSignal<number>,
  options?: DebouncedOptions<SignalValue<S>>
): Signal<SignalValue<S>>;

// Overload 2: Writable signal from value
function debounced<V>(
  value: V,
  timeMs: MaybeSignal<number>,
  options?: DebouncedOptions<V>
): WritableSignal<V>;
```

## Related

- [Throttled](/reactivity/throttled) — Rate-limits updates instead of waiting for inactivity
- [DebounceCallback](/scheduling/debounce-callback) — Debounced callback function

---
source: https://github.com/signalityjs/signality/blob/main/projects/core/observers/performance-observer/index.ts
---

# PerformanceObserver

Low-level utility for observing performance measurement events using the [Performance Observer API](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceObserver). Provides reactive access to performance entries as they are recorded in the browser's performance timeline.

## Usage

### Basic usage

Observe performance entries by specifying entry types:

```angular-ts
import { Component, signal } from '@angular/core';
import { performanceObserver } from '@signality/core';

@Component({
  template: `<div>LCP: {{ lcp() }}ms</div>`,
})
export class PerformanceExample {
  readonly lcp = signal(0);

  constructor() {
    performanceObserver(entries => { // [!code highlight]
      const lcpEntry = entries.find(e => e.entryType === 'largest-contentful-paint');
      if (lcpEntry) {
        this.lcp.set(Math.round(lcpEntry.startTime));
      }
    }, { entryTypes: ['largest-contentful-paint'] });
  }
}
```

### Track Long Tasks

Monitor JavaScript tasks that block the main thread for more than 50ms:

```angular-ts
import { Component, signal } from '@angular/core';
import { performanceObserver } from '@signality/core';

@Component({
  template: `<div>Long tasks: {{ longTaskCount() }}</div>`,
})
export class LongTaskTracker {
  readonly longTaskCount = signal(0);

  constructor() {
    performanceObserver(entries => { // [!code highlight]
      this.longTaskCount.set(prev => prev + entries.length);
    }, { entryTypes: ['longtask'] });
  }
}
```

### Using type (single entry type)

Use the `type` option for a single entry type (legacy API):

```angular-ts
import { Component, signal } from '@angular/core';
import { performanceObserver } from '@signality/core';

@Component({
  template: `<div>Navigation: {{ navTime() }}ms</div>`,
})
export class NavigationTiming {
  readonly navTime = signal(0);

  constructor() {
    performanceObserver(entries => {
      if (entries[0]) {
        const nav = entries[0] as PerformanceNavigationTiming;
        this.navTime.set(Math.round(nav.loadEventEnd - nav.startTime));
      }
    }, { type: 'navigation', buffered: true }); // [!code highlight]
  }
}
```

### Manual cleanup

Observers are automatically disconnected after the view is destroyed (see [Automatic cleanup](/guide/key-concepts#automatic-cleanup)). However, the returned `PerformanceObserverRef` can be destroyed to stop observation manually:

```angular-ts
import { Component, signal } from '@angular/core';
import { performanceObserver, type PerformanceObserverRef } from '@signality/core';

@Component({
  template: `<button (click)="stop()">Stop</button>`,
})
export class ManualCleanup {
  readonly observer: PerformanceObserverRef;

  constructor() {
    this.observer = performanceObserver(entries => {
      console.log(entries);
    }, { entryTypes: ['longtask'] });
  }

  stop() {
    this.observer.destroy();
  }
}
```

## Parameters

| Parameter  | Type                                                           | Description                                                                                     |
|------------|----------------------------------------------------------------|-------------------------------------------------------------------------------------------------|
| `callback` | `PerformanceObserverCallback`                                 | Callback function called when performance entries are recorded                                  |
| `options`  | `PerformanceObserverInitOptions`                              | Optional configuration (see [Options](#options) below)                                         |

## Options

The `PerformanceObserverInitOptions` extends [`Omit<CreateEffectOptions, 'allowSignalWrites'>`](https://angular.dev/api/core/CreateEffectOptions):

| Option                                                                 | Type                                                                             | Description                                                                                                                      |
|------------------------------------------------------------------------|----------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------|
| [`entryTypes`](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceObserver/observe#entryTypes) | [`MaybeSignal<string[]>`](/reference/utility-types#maybesignal-lt-type-gt) | Array of performance entry types to observe. Cannot be used with `type`. See [Available Entry Types](#available-entry-types) |
| [`type`](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceObserver/observe#type)             | [`MaybeSignal<string>`](/reference/utility-types#maybesignal-lt-type-gt)     | Single performance entry type to observe. Cannot be used with `entryTypes`. Legacy API                                          |
| [`buffered`](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceObserver/observe#buffered)     | [`MaybeSignal<boolean>`](/reference/utility-types#maybesignal-lt-type-gt)    | Whether to include buffered entries in the observer callback                                                                    |
| `manualCleanup`                                                       | `boolean`                                                                        | If `true`, the effect requires manual cleanup. By default, the effect automatically registers itself for cleanup with the current `DestroyRef` |
| `debugName`                                                           | `string`                                                                         | Debug name for the effect (used in Angular DevTools)                                                                            |
| `injector`                                                            | [`Injector`](https://angular.dev/api/core/Injector)                               | Optional injector for DI context                                                                                                |

## Available Entry Types

| Entry Type                              | Description                                                                 |
|-----------------------------------------|-----------------------------------------------------------------------------|
| `paint`                                 | First paint and first contentful paint                                      |
| `largest-contentful-paint`              | Largest contentful paint (LCP)                                              |
| `layout-shift`                          | Cumulative layout shifts (CLS)                                               |
| `first-input`                           | First input delay (FID)                                                     |
| `event`                                 | Event timing (for INP)                                                      |
| `longtask`                              | Long tasks (>50ms)                                                          |
| `navigation`                            | Navigation timing                                                           |
| `resource`                              | Resource loading timing                                                     |
| `mark`                                  | Custom performance marks                                                    |
| `measure`                               | Custom performance measures                                                 |
| `element`                               | Element timing (load time of elements)                                      |
| `visibility-state`                      | Page visibility state changes                                               |

## Return Value

Returns a `PerformanceObserverRef` with a `destroy()` method to stop observing.

## SSR Compatibility

On the server, `performanceObserver` returns a no-op `PerformanceObserverRef` that safely handles `destroy()` calls without creating actual observers.

## Type Definitions

```typescript
interface PerformanceObserverInitOptions extends Omit<CreateEffectOptions, 'allowSignalWrites'> {
  readonly entryTypes?: MaybeSignal<string[]>;
  readonly type?: MaybeSignal<string>;
  readonly buffered?: MaybeSignal<boolean>;
}

interface PerformanceObserverRef {
  readonly destroy: () => void;
}

function performanceObserver(
  callback: PerformanceObserverCallback,
  options?: PerformanceObserverInitOptions
): PerformanceObserverRef;
```

## Related

- [Web Vitals](https://web.dev/vitals/) — Google's core web vitals metrics
- [MDN: PerformanceObserver](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceObserver) — Official documentation

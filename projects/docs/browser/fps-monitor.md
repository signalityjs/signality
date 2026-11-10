---
source: https://github.com/signalityjs/signality/blob/main/projects/core/browser/fps-monitor/index.ts
---

# FpsMonitor

Reactive FPS (Frames Per Second) monitor using [requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame). Track rendering performance with Angular signals.

<Demo name="fps" />

## Usage

```angular-ts
import { Component } from '@angular/core';
import { fpsMonitor } from '@signality/core';

@Component({
  template: `<p>FPS: {{ monitor.value() }}</p>`,
})
export class FpsDisplay {
  readonly monitor = fpsMonitor(); // [!code highlight]
}
```

::: warning Use InjectionToken for Singleton
For global state tracking like `fpsMonitor`, consider using the provided `FPS_MONITOR` token instead of calling the function directly. This provides a singleton instance that can be shared across your entire application, reducing memory usage and event listener overhead:

```typescript
import { inject } from '@angular/core';
import { FPS_MONITOR } from '@signality/core';

const monitor = fpsMonitor(); // [!code --]
const monitor = inject(FPS_MONITOR); // [!code ++]
```

Learn more about [Token-based utilities](/guide/key-concepts#token-based-utilities).
:::

## Parameters

| Parameter | Type                | Description                                            |
|-----------|---------------------|--------------------------------------------------------|
| `options` | `FpsMonitorOptions` | Optional configuration (see [Options](#options) below) |

## Options

| Option       | Type       | Default | Description                      |
|--------------|------------|---------|----------------------------------|
| `immediate`  | `boolean`  | `true`  | Start monitoring immediately     |
| `sampleSize` | `number`   | `60`    | Number of frames to average      |
| `injector`   | [`Injector`](https://angular.dev/api/core/Injector) | -       | Optional injector for DI context |

## Return Value

The `fpsMonitor()` function returns an `FpsMonitorRef` object:

| Property | Type | Description |
|----------|------|-------------|
| `value` | `Signal<number>` | Current frames per second |
| `isRunning` | `Signal<boolean>` | Whether monitoring is active |
| `start` | `() => void` | Start FPS monitoring |
| `stop` | `() => void` | Stop FPS monitoring |

## Examples

### Performance monitor

```angular-ts
import { Component, computed } from '@angular/core';
import { fpsMonitor } from '@signality/core';

@Component({
  template: `
    <div class="fps-monitor" [class]="performanceClass()">
      <span class="fps-value">{{ monitor.value() }}</span>
      <span class="fps-label">FPS</span>
    </div>
  `,
})
export class PerformanceMonitor {
  readonly monitor = fpsMonitor(); // [!code highlight]
  
  readonly performanceClass = computed(() => {
    const currentFps = this.monitor.value();
    if (currentFps >= 55) return 'good';
    if (currentFps >= 30) return 'medium';
    return 'poor';
  });
}
```

### Adaptive quality

```angular-ts
import { Component, signal, effect } from '@angular/core';
import { fpsMonitor } from '@signality/core';

type Quality = 'high' | 'medium' | 'low';

@Component({
  template: `
    <canvas #canvas></canvas>
    <p>Quality: {{ quality() }}</p>
  `,
})
export class AdaptiveRenderer {
  readonly monitor = fpsMonitor();
  readonly quality = signal<Quality>('high');
  
  constructor() {
    effect(() => {
      const currentFps = this.monitor.value();
      
      // Automatically adjust quality based on FPS
      if (currentFps < 25 && this.quality() !== 'low') {
        this.quality.set('low');
      } else if (currentFps < 45 && this.quality() === 'high') {
        this.quality.set('medium');
      } else if (currentFps >= 55 && this.quality() !== 'high') {
        this.quality.set('high');
      }
    });
  }
}
```

## SSR Compatibility

On the server, signals initialize with safe defaults:

- `value` → `0`
- `isRunning` → `false`
- `start`, `stop` → no-op functions

## Type Definitions

```typescript
interface FpsMonitorOptions extends WithInjector {
  readonly immediate?: boolean;
  readonly sampleSize?: number;
}

interface FpsMonitorRef {
  readonly value: Signal<number>;
  readonly isRunning: Signal<boolean>;
  readonly start: () => void;
  readonly stop: () => void;
}

function fpsMonitor(options?: FpsMonitorOptions): FpsMonitorRef;

const FPS_MONITOR: InjectionToken<FpsMonitorRef>;
```

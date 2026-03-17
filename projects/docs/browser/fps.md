---
source: https://github.com/signalityjs/signality/blob/main/projects/core/browser/fps/index.ts
---

# Fps

Reactive FPS (Frames Per Second) monitor using [requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame). Track rendering performance with Angular signals.

<Demo name="fps" />

## Usage

```angular-ts
import { Component } from '@angular/core';
import { fps } from '@signality/core';

@Component({
  template: `<p>FPS: {{ fpsMonitor.fps() }}</p>`,
})
export class FpsDisplay {
  readonly fpsMonitor = fps(); // [!code highlight]
}
```

::: warning Use InjectionToken for Singleton
For global state tracking like `fps`, consider using the provided `FPS` token instead of calling the function directly. This provides a singleton instance that can be shared across your entire application, reducing memory usage and event listener overhead:

```typescript
import { inject } from '@angular/core';
import { FPS } from '@signality/core';

const fpsMonitor = fps(); // [!code --]
const fpsMonitor = inject(FPS); // [!code ++]
```

Learn more about [Token-based utilities](/guide/key-concepts#token-based-utilities).
:::

## Parameters

| Parameter | Type         | Description                                            |
|-----------|--------------|--------------------------------------------------------|
| `options` | `FpsOptions` | Optional configuration (see [Options](#options) below) |

## Options

| Option       | Type       | Default | Description                      |
|--------------|------------|---------|----------------------------------|
| `immediate`  | `boolean`  | `true`  | Start monitoring immediately     |
| `sampleSize` | `number`   | `60`    | Number of frames to average      |
| `injector`   | [`Injector`](https://angular.dev/api/core/Injector) | -       | Optional injector for DI context |

## Return Value

The `fps()` function returns an `FpsRef` object:

| Property | Type | Description |
|----------|------|-------------|
| `fps` | `Signal<number>` | Current frames per second |
| `isRunning` | `Signal<boolean>` | Whether monitoring is active |
| `start` | `() => void` | Start FPS monitoring |
| `stop` | `() => void` | Stop FPS monitoring |

## Examples

### Performance monitor

```angular-ts
import { Component, computed } from '@angular/core';
import { fps } from '@signality/core';

@Component({
  template: `
    <div class="fps-monitor" [class]="performanceClass()">
      <span class="fps-value">{{ fpsMonitor.fps() }}</span>
      <span class="fps-label">FPS</span>
    </div>
  `,
})
export class PerformanceMonitor {
  readonly fpsMonitor = fps(); // [!code highlight]
  
  readonly performanceClass = computed(() => {
    const currentFps = this.fpsMonitor.fps();
    if (currentFps >= 55) return 'good';
    if (currentFps >= 30) return 'medium';
    return 'poor';
  });
}
```

### Adaptive quality

```angular-ts
import { Component, signal, effect } from '@angular/core';
import { fps } from '@signality/core';

type Quality = 'high' | 'medium' | 'low';

@Component({
  template: `
    <canvas #canvas></canvas>
    <p>Quality: {{ quality() }}</p>
  `,
})
export class AdaptiveRenderer {
  readonly fpsMonitor = fps();
  readonly quality = signal<Quality>('high');
  
  constructor() {
    effect(() => {
      const currentFps = this.fpsMonitor.fps();
      
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

- `fps` → `0`
- `isRunning` → `false`
- `start`, `stop` → no-op functions

## Type Definitions

```typescript
interface FpsOptions extends WithInjector {
  readonly immediate?: boolean;
  readonly sampleSize?: number;
}

interface FpsRef {
  readonly fps: Signal<number>;
  readonly isRunning: Signal<boolean>;
  readonly start: () => void;
  readonly stop: () => void;
}

function fps(options?: FpsOptions): FpsRef;
```

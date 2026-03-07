---
source: https://github.com/signalityjs/signality/blob/main/projects/core/elements/window-size/index.ts
---

# WindowSize

Reactive tracking of browser window dimensions. Automatically updates on window resize.

<Demo name="window-size" />

## Usage

```angular-ts
import { Component } from '@angular/core';
import { windowSize } from '@signality/core';

@Component({
  template: `
    <p>Window: {{ size().width }} × {{ size().height }}</p>
  `,
})
export class WindowSizeDemo {
  readonly size = windowSize(); // [!code highlight]
}
```

::: warning Use InjectionToken for Singleton
For global state tracking like `windowSize`, consider using the provided `WINDOW_SIZE` token instead of calling the function directly. This provides a singleton instance that can be shared across your entire application, reducing memory usage and event listener overhead:

```typescript
import { inject } from '@angular/core';
import { WINDOW_SIZE } from '@signality/core';

const size = windowSize(); // [!code --]
const size = inject(WINDOW_SIZE); // [!code ++]
```

Learn more about [Token-based utilities](/guide/key-concepts#token-based-utilities).
:::

## Parameters

| Parameter | Type                | Description                                            |
|-----------|---------------------|--------------------------------------------------------|
| `options` | `WindowSizeOptions` | Optional configuration (see [Options](#options) below) |

## Options

The `WindowSizeOptions` extends [`CreateSignalOptions<WindowSizeValue>`](https://angular.dev/api/core/CreateSignalOptions) and `WithInjector`:

| Option             | Type                                                                               | Default | Description                                                                                        |
|--------------------|------------------------------------------------------------------------------------|---------|----------------------------------------------------------------------------------------------------|
| `includeScrollbar` | `boolean`                                                                          | `false` | Include scrollbar in dimensions                                                                    |
| `initialValue`     | `{ width, height }`                                                                | -       | Initial dimensions for SSR                                                                         |
| `equal`            | [`ValueEqualityFn<WindowSizeValue>`](https://angular.dev/api/core/ValueEqualityFn) | -       | Custom equality function ([see more](https://angular.dev/guide/signals#signal-equality-functions)) |
| `debugName`        | `string`                                                                           | -       | Debug name for the signal (development only)                                                       |
| `injector`         | [`Injector`](https://angular.dev/api/core/Injector)                                | -       | Optional injector for DI context                                                                   |

## Return Value

The `windowSize()` function returns a `Signal<WindowSizeValue>`:

```typescript
interface WindowSizeValue {
  width: number;
  height: number;
  innerWidth: number;
  innerHeight: number;
  outerWidth: number;
  outerHeight: number;
}
```

| Property      | Description                                                                                          |
|---------------|------------------------------------------------------------------------------------------------------|
| `width`       | Viewport width — excludes scrollbar by default; same as `innerWidth` when `includeScrollbar: true`   |
| `height`      | Viewport height — excludes scrollbar by default; same as `innerHeight` when `includeScrollbar: true` |
| `innerWidth`  | `window.innerWidth` (always includes scrollbar)                                                      |
| `innerHeight` | `window.innerHeight` (always includes scrollbar)                                                     |
| `outerWidth`  | Window outer width (including browser UI)                                                            |
| `outerHeight` | Window outer height (including browser UI)                                                           |

## Examples

### Aspect ratio detection

```angular-ts
import { Component, computed } from '@angular/core';
import { windowSize } from '@signality/core';

@Component({
  template: `
    <div [attr.data-orientation]="orientation()">
      <ng-content />
    </div>
  `,
})
export class OrientationAware {
  readonly size = windowSize();
  
  readonly isPortrait = computed(() => this.size().height > this.size().width);
  
  readonly orientation = computed(() => {
    return this.isPortrait() ? 'portrait' : 'landscape'; // [!code highlight]
  });
}
```

### Column count

```angular-ts
import { Component, computed } from '@angular/core';
import { windowSize } from '@signality/core';

@Component({
  template: `
    <div class="grid" [style.--columns]="columns()">
      @for (item of items; track item.id) {
        <div class="grid-item">{{ item.name }}</div>
      }
    </div>
  `,
  styles: `
    .grid {
      display: grid;
      grid-template-columns: repeat(var(--columns), 1fr);
    }
  `,
})
export class DynamicGrid {
  readonly size = windowSize();
  readonly items = [/* ... */];
  
  readonly columns = computed(() => {
    const width = this.size().width;
    if (width < 640) return 1;
    if (width < 1024) return 2;
    if (width < 1536) return 3;
    return 4; // [!code highlight]
  });
}
```

### Viewport-sized canvas

```angular-ts
import { Component, effect, viewChild, ElementRef } from '@angular/core';
import { windowSize } from '@signality/core';

@Component({
  template: `<canvas #canvas></canvas>`,
  styles: `canvas { display: block; }`,
})
export class FullscreenCanvas {
  readonly canvas = viewChild.required<ElementRef>('canvas');
  readonly size = windowSize();
  
  constructor() {
    effect(() => {
      const canvasEl = this.canvas().nativeElement;
      const { width, height } = this.size(); // [!code highlight]
      
      canvasEl.width = width;
      canvasEl.height = height;
      
      this.redraw();
    });
  }
  
  private redraw() {
    // Draw to canvas
  }
}
```

### Debug viewport overlay

```angular-ts
import { Component } from '@angular/core';
import { windowSize } from '@signality/core';
import { environment } from '../environments/environment';

@Component({
  template: `
    @if (!environment.production) {
      <div class="debug-overlay">
        {{ size().width }}×{{ size().height }}
      </div>
    }
  `,
  styles: `
    .debug-overlay {
      position: fixed;
      bottom: 10px;
      right: 10px;
      padding: 4px 8px;
      background: rgba(0,0,0,0.7);
      color: white;
      font-size: 12px;
      z-index: 9999;
    }
  `,
})
export class ViewportDebug {
  readonly environment = environment;
  readonly size = windowSize();
}
```

## SSR Compatibility

On the server, the signal initializes with default values. You can provide initial values for SSR:

```typescript
const size = windowSize({
  initialValue: { width: 1024, height: 768 }
});
```

Default values:

- `width` → `0`
- `height` → `0`
- `innerWidth` → `0`
- `innerHeight` → `0`
- `outerWidth` → `0`
- `outerHeight` → `0`

## Type Definitions

```typescript
interface WindowSizeValue {
  width: number;
  height: number;
  innerWidth: number;
  innerHeight: number;
  outerWidth: number;
  outerHeight: number;
}

interface WindowSizeOptions extends CreateSignalOptions<WindowSizeValue>, WithInjector {
  readonly includeScrollbar?: boolean;
  readonly initialValue?: { width: number; height: number };
}

function windowSize(options?: WindowSizeOptions): Signal<WindowSizeValue>;
```

## Related

- [ElementSize](/elements/element-size) — Track element dimensions
- [ScrollPosition](/elements/scroll-position) — Track scroll position

---
source: https://github.com/signalityjs/signality/blob/main/projects/core/browser/window-size/index.ts
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

| Option             | Type                                                                               | Default                   | Description                                                                                        |
|--------------------|------------------------------------------------------------------------------------|---------------------------|----------------------------------------------------------------------------------------------------|
| `includeScrollbar` | `boolean`                                                                          | `false`                   | Include scrollbar in dimensions                                                                    |
| `initialValue`     | `WindowSizeValue`                                                                  | `{ width: 0, height: 0 }` | Initial value for SSR and before the first measurement                                             |
| `equal`            | [`ValueEqualityFn<WindowSizeValue>`](https://angular.dev/api/core/ValueEqualityFn) | -                         | Custom equality function ([see more](https://angular.dev/guide/signals#signal-equality-functions)) |
| `debugName`        | `string`                                                                           | -                         | Debug name for the signal (development only)                                                       |
| `injector`         | [`Injector`](https://angular.dev/api/core/Injector)                                | -                         | Optional injector for DI context                                                                   |

## Return Value

The `windowSize()` function returns a `Signal<WindowSizeValue>`:

```typescript
interface WindowSizeValue {
  readonly width: number;
  readonly height: number;
}
```

| Property | Description                                                                                                                      |
|----------|----------------------------------------------------------------------------------------------------------------------------------|
| `width`  | Viewport width — excludes scrollbar by default; includes scrollbar when `includeScrollbar: true`  |
| `height` | Viewport height — excludes scrollbar by default; includes scrollbar when `includeScrollbar: true` |

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
      const { width, height } = this.size();

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

## SSR Compatibility

On the server, the signal initializes with `initialValue` (defaults to `{ width: 0, height: 0 }`).

## Type Definitions

```typescript
interface WindowSizeValue {
  readonly width: number;
  readonly height: number;
}

interface WindowSizeOptions extends CreateSignalOptions<WindowSizeValue>, WithInjector {
  readonly includeScrollbar?: boolean;
  readonly initialValue?: WindowSizeValue;
}

function windowSize(options?: WindowSizeOptions): Signal<WindowSizeValue>;

const WINDOW_SIZE: InjectionToken<Signal<WindowSizeValue>>;
```

## Related

- [ElementSize](/elements/element-size) — Track element dimensions
- [ScrollPosition](/elements/scroll-position) — Track scroll position

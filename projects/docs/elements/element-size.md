---
source: https://github.com/signalityjs/signality/blob/main/projects/core/elements/element-size/index.ts
---

# ElementSize

Reactive tracking of element dimensions using [ResizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver). Automatically updates when element size changes.

<Demo name="element-size" />

## Usage

```angular-ts
import { Component, viewChild, ElementRef } from '@angular/core';
import { elementSize } from '@signality/core';

@Component({
  template: `
    <div #box class="resizable">
      {{ size().width }} × {{ size().height }}
    </div>
  `,
})
export class SizeDemo {
  readonly box = viewChild<ElementRef>('box');
  readonly size = elementSize(this.box); // [!code highlight]
}
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `target` | [`MaybeElementSignal<HTMLElement>`](/reference/utility-types#maybeelementsignal-lt-type-gt) | Target element to observe |
| `options` | `ElementSizeOptions` | Optional configuration (see [Options](#options) below) |

## Options

The `ElementSizeOptions` extends [`CreateSignalOptions<ElementSizeValue>`](https://angular.dev/api/core/CreateSignalOptions) and `WithInjector`:

| Option      | Type                              | Default       | Description                                    |
|-------------|-----------------------------------|---------------|------------------------------------------------|
| [`box`](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver/observe#box)       | [`MaybeSignal<ResizeObserverBoxOptions>`](/reference/utility-types#maybesignal-lt-type-gt) | `'border-box'`| Which box model to observe |
| `equal`     | [`ValueEqualityFn<ElementSizeValue>`](https://angular.dev/api/core/ValueEqualityFn)| -             | Custom equality function ([see more](https://angular.dev/guide/signals#signal-equality-functions)) |
| `debugName` | `string`                          | -             | Debug name for the signal (development only)   |
| `injector`  | [`Injector`](https://angular.dev/api/core/Injector)                        | -             | Optional injector for DI context               |

## Return Value

The `elementSize()` function returns a `Signal<ElementSizeValue>`:

```typescript
interface ElementSizeValue {
  width: number;
  height: number;
  contentWidth: number;
  contentHeight: number;
  borderBoxWidth: number;
  borderBoxHeight: number;
}
```

| Property | Description |
|----------|-------------|
| `width` | Element width (depends on the `box` option — border-box by default, content-box when `box: 'content-box'`) |
| `height` | Element height (depends on the `box` option — border-box by default, content-box when `box: 'content-box'`) |
| `contentWidth` | Content area width |
| `contentHeight` | Content area height |
| `borderBoxWidth` | Border-box width |
| `borderBoxHeight` | Border-box height |

## Examples

### Responsive component

```angular-ts
import { Component, viewChild, ElementRef, computed } from '@angular/core';
import { elementSize } from '@signality/core';

@Component({
  template: `
    <div #container [class]="layoutClass()">
      <ng-content />
    </div>
  `,
})
export class ResponsiveContainer {
  readonly container = viewChild<ElementRef>('container');
  readonly size = elementSize(this.container);
  
  readonly layoutClass = computed(() => {
    const width = this.size().width;
    if (width < 400) return 'layout-compact';
    if (width < 800) return 'layout-medium';
    return 'layout-wide'; // [!code highlight]
  });
}
```

### Aspect ratio keeper

```angular-ts
import { Component, viewChild, ElementRef, computed } from '@angular/core';
import { elementSize } from '@signality/core';

@Component({
  template: `
    <div #container class="video-container">
      <video [style.height.px]="videoHeight()"></video>
    </div>
  `,
})
export class AspectRatioVideo {
  readonly container = viewChild<ElementRef>('container');
  readonly size = elementSize(this.container);
  
  readonly aspectRatio = 16 / 9;
  
  readonly videoHeight = computed(() => 
    this.size().width / this.aspectRatio // [!code highlight]
  );
}
```

### Canvas auto-resize

```angular-ts
import { Component, viewChild, ElementRef, effect } from '@angular/core';
import { elementSize } from '@signality/core';

@Component({
  template: `
    <div #wrapper class="canvas-wrapper">
      <canvas #canvas></canvas>
    </div>
  `,
})
export class AutoCanvas {
  readonly wrapper = viewChild<ElementRef>('wrapper');
  readonly canvas = viewChild<ElementRef<HTMLCanvasElement>>('canvas');
  readonly size = elementSize(this.wrapper);
  
  constructor() {
    effect(() => {
      const canvasEl = this.canvas()?.nativeElement;
      if (!canvasEl) return;
      
      const { width, height } = this.size();
      const dpr = window.devicePixelRatio || 1;
      
      canvasEl.width = width * dpr;
      canvasEl.height = height * dpr;
      canvasEl.style.width = `${width}px`;
      canvasEl.style.height = `${height}px`;
      
      // redraw canvas content
      this.redraw(canvasEl.getContext('2d')!);
    });
  }
  
  private redraw(ctx: CanvasRenderingContext2D) {
    // drawing logic
  }
}
```

### Overflow detection

```angular-ts
import { Component, viewChild, ElementRef, computed } from '@angular/core';
import { elementSize } from '@signality/core';

@Component({
  template: `
    <div #container class="content-container">
      <div #content>{{ text }}</div>
    </div>
    @if (isOverflowing()) {
      <button (click)="showMore()">Show more...</button>
    }
  `,
})
export class OverflowDetector {
  readonly container = viewChild<ElementRef>('container');
  readonly content = viewChild<ElementRef>('content');
  
  readonly containerSize = elementSize(this.container);
  readonly contentSize = elementSize(this.content);
  
  text = 'Long content...';
  
  readonly isOverflowing = computed(() => 
    this.contentSize().height > this.containerSize().height
  );
  
  showMore() {
    // Expand container
  }
}
```

## SSR Compatibility

On the server, the signal initializes with default zero values:

- `width` → `0`
- `height` → `0`
- `contentWidth` → `0`
- `contentHeight` → `0`
- `borderBoxWidth` → `0`
- `borderBoxHeight` → `0`

## Type Definitions

```typescript
interface ElementSizeValue {
  width: number;
  height: number;
  contentWidth: number;
  contentHeight: number;
  borderBoxWidth: number;
  borderBoxHeight: number;
}

type ElementSizeOptions = CreateSignalOptions<ElementSizeValue> &
  WithInjector & {
    readonly box?: MaybeSignal<ResizeObserverBoxOptions>;
  };

function elementSize(
  target: MaybeElementSignal<HTMLElement>,
  options?: ElementSizeOptions
): Signal<ElementSizeValue>;
```

## Related

- [WindowSize](/elements/window-size) — Track window dimensions

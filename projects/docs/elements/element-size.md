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

| Parameter | Type                                                                                        | Description                                            |
|-----------|---------------------------------------------------------------------------------------------|--------------------------------------------------------|
| `target`  | [`MaybeElementSignal<HTMLElement>`](/reference/utility-types#maybeelementsignal-lt-type-gt) | Target element to observe                              |
| `options` | `ElementSizeOptions`                                                                        | Optional configuration (see [Options](#options) below) |

## Options

The `ElementSizeOptions` extends [`CreateSignalOptions<ElementSizeValue>`](https://angular.dev/api/core/CreateSignalOptions) and `WithInjector`:

| Option                                                                               | Type                                                                                       | Default                   | Description                                                                                        |
|--------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------|---------------------------|----------------------------------------------------------------------------------------------------|
| [`box`](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver/observe#box) | [`MaybeSignal<ResizeObserverBoxOptions>`](/reference/utility-types#maybesignal-lt-type-gt) | `'border-box'`            | Which box model to observe                                                                         |
| `initialValue`                                                                       | `ElementSizeValue`                                                                         | `{ width: 0, height: 0 }` | Initial value for SSR and before the first measurement                                             |
| `equal`                                                                              | [`ValueEqualityFn<ElementSizeValue>`](https://angular.dev/api/core/ValueEqualityFn)        | -                         | Custom equality function ([see more](https://angular.dev/guide/signals#signal-equality-functions)) |
| `debugName`                                                                          | `string`                                                                                   | -                         | Debug name for the signal (development only)                                                       |
| `injector`                                                                           | [`Injector`](https://angular.dev/api/core/Injector)                                        | -                         | Optional injector for DI context                                                                   |

## Return Value

The `elementSize()` function returns a `Signal<ElementSizeValue>`:

```typescript
interface ElementSizeValue {
  width: number;
  height: number;
}
```

| Property | Description                                                                                                 |
|----------|-------------------------------------------------------------------------------------------------------------|
| `width`  | Element width (depends on the `box` option — border-box by default, content-box when `box: 'content-box'`)  |
| `height` | Element height (depends on the `box` option — border-box by default, content-box when `box: 'content-box'`) |

## Examples

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

### Overflow detection

```angular-ts
import { Component, viewChild, ElementRef, computed } from '@angular/core';
import { elementSize } from '@signality/core';

@Component({
  template: `
    <div #container class="content-container">
      <div #content>{{ text }}</div>
    </div>
    @if (isOverflowing()) { <!-- [!code highlight] -->
      <button (click)="showMore()">Show more...</button> <!-- [!code highlight] -->
    } <!-- [!code highlight] -->
  `,
})
export class OverflowDetector {
  readonly container = viewChild<ElementRef>('container');
  readonly content = viewChild<ElementRef>('content');
  
  readonly containerSize = elementSize(this.container);
  readonly contentSize = elementSize(this.content);
  
  readonly text = 'Long content...';
  
  readonly isOverflowing = computed(() => 
    this.contentSize().height > this.containerSize().height
  );
  
  showMore() {
    // Expand container
  }
}
```

## SSR Compatibility

On the server, the signal initializes with `initialValue` (defaults to `{ width: 0, height: 0 }`).

## Type Definitions

```typescript
interface ElementSizeValue {
  readonly width: number;
  readonly height: number;
}

interface ElementSizeOptions extends CreateSignalOptions<ElementSizeValue>, WithInjector {
  readonly box?: MaybeSignal<ResizeObserverBoxOptions>;
  readonly initialValue?: ElementSizeValue;
}

function elementSize(
  target: MaybeElementSignal<HTMLElement>,
  options?: ElementSizeOptions
): Signal<ElementSizeValue>;
```

## Related

- [WindowSize](/browser/window-size) — Track window dimensions

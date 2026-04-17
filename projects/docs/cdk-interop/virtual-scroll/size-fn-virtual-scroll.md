---
source: https://github.com/signalityjs/signality/blob/main/projects/cdk-interop/virtual-scroll/size-fn-virtual-scroll/index.ts
---

# SizeFnVirtualScroll

Signal based directive for applying a varying itemSize virtual scroll strategy on [CdkVirtualScrollViewport](https://material.angular.dev/cdk/scrolling/api#CdkVirtualScrollViewport).
The directive allows passing an itemSizeFn and optional minBufferPx, maxBufferPx, gap, paddingTop, paddingBottom.

::: warning CDK Interop Package Required
This utility requires the `@signality/cdk-interop` and `@angular/cdk` packages to be installed:

```bash
npm install @signality/cdk-interop @angular/cdk
```

:::

## Usage
```angular-ts
import { ScrollingModule } from '@angular/cdk/scrolling';
import { Component } from '@angular/core';
import { SizeFnVirtualScroll } from '@signality/cdk-interop';

@Component({
  template: `
    <cdk-virtual-scroll-viewport [itemSizeFn] ="itemSizeFn" [gap]="gap">
      <div
        *cdkVirtualFor="let item of items; let i = index; let last = last"
        [style.height.px]="itemSizeFn(i)"
        [style.margin-bottom.px]="last ? 0 : gap"
      >
        {{ item }}
      </div>
    </cdk-virtual-scroll-viewport>
  `,
  imports: [ScrollingModule, SizeFnVirtualScroll],
})
export class FocusDemo {
  protected readonly items = Array.from({ length: 100_000 }).map((_, i) => `Item #${i}`);
  protected readonly gap = 10;
  protected readonly itemSizeFn = (index: number) => (index % 2 === 0 ? 50 : 30);
}
```

## Inputs
| Input | Type | Description |
|-------|------|-------------|
| `itemSizeFn`    | `VirtualScrollItemSizeFn`   | The varying item size fn that decides the size of each item given `index` and `dataLength` |
| `gap`    | `number`   | The gap between items |
| `paddingTop`    | `number`   | The padding above the first item |
| `paddingBottom`    | `number`   | The padding below the last item |
| `minBufferPx`    | `number`   | Exactly the same as [FixedSizeVirtualScrollStrategy](https://material.angular.dev/cdk/scrolling/api#FixedSizeVirtualScrollStrategy) |
| `maxBufferPx`    | `number`   | Exactly the same as [FixedSizeVirtualScrollStrategy](https://material.angular.dev/cdk/scrolling/api#FixedSizeVirtualScrollStrategy) |

## Examples

### Fixed size
```angular-ts
import { ScrollingModule } from '@angular/cdk/scrolling';
import { Component } from '@angular/core';
import { SizeFnVirtualScroll } from '@signality/cdk-interop';

@Component({
  template: `
    <cdk-virtual-scroll-viewport [itemSizeFn]="itemSizeFn">
      <div *cdkVirtualFor="let item of items; let i = index" [style.height.px]="itemSize">
        {{ item }}
      </div>
    </cdk-virtual-scroll-viewport>
  `,
  imports: [ScrollingModule, SizeFnVirtualScroll],
})
export class FocusDemo {
  protected readonly items = Array.from({ length: 100_000 }).map((_, i) => `Item #${i}`);
  protected readonly itemSize = 50;
  protected readonly itemSizeFn = () => this.itemSize;
}
```

### Dynamic size
```angular-ts
import { ScrollingModule } from '@angular/cdk/scrolling';
import { Component } from '@angular/core';
import { SizeFnVirtualScroll } from '@signality/cdk-interop';

@Component({
  template: `
    <cdk-virtual-scroll-viewport [itemSizeFn]="itemSizeFn">
      <div *cdkVirtualFor="let item of items; let i = index" [style.height.px]="itemSizeFn(i)">
        {{ item }}
      </div>
    </cdk-virtual-scroll-viewport>
  `,
  imports: [ScrollingModule, SizeFnVirtualScroll],
})
export class FocusDemo {
  protected readonly items = Array.from({ length: 100_000 }).map((_, i) => `Item #${i}`);
  protected readonly itemSizeFn = (index: number) => (index % 2 === 0 ? 50 : 30);
}
```

### Dynamic size with gap, padding
```angular-ts
import { ScrollingModule } from '@angular/cdk/scrolling';
import { Component } from '@angular/core';
import { SizeFnVirtualScroll } from '@signality/cdk-interop';

@Component({
  template: `
    <cdk-virtual-scroll-viewport
      [itemSizeFn]="itemSizeFn"
      [gap]="gap"
      [paddingTop]="paddingTop"
      [paddingBottom]="paddingBottom"
    >
      <div
        *cdkVirtualFor="let item of items; let i = index; let last = last; let first = first"
        [style.height.px]="itemSizeFn(i)"
        [style.margin-bottom.px]="last ? paddingBottom : gap"
        [style.margin-top.px]="first ? paddingTop : 0"
      >
        {{ item }}
      </div>
    </cdk-virtual-scroll-viewport>
  `,
  imports: [ScrollingModule, SizeFnVirtualScroll],
})
export class FocusDemo {
  protected readonly items = Array.from({ length: 100_000 }).map((_, i) => `Item #${i}`);
  protected readonly gap = 10;
  protected readonly paddingTop = 20;
  protected readonly paddingBottom = 20;
  protected readonly itemSizeFn = (index: number) => (index % 2 === 0 ? 50 : 30);
}
```

## Type Definitions

```typescript
type VirtualScrollItemSizeFn = (index: number, dataLength: number) => number;
```
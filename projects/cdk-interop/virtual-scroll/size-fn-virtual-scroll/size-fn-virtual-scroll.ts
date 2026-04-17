import { Directive, inject, input, numberAttribute, effect, computed } from '@angular/core';
import type { VirtualScrollItemSizeFn } from './virtual-scroll-item-size-fn';
import { VIRTUAL_SCROLL_STRATEGY } from '@angular/cdk/scrolling';
import { SizeFnVirtualScrollStrategy } from './size-fn-virtual-scroll-strategy';

/**
 * Signal based directive for applying a varying itemSize virtual scroll strategy on [CdkVirtualScrollViewport](https://material.angular.dev/cdk/scrolling/api#CdkVirtualScrollViewport).
 *
 * @example
 * ```angular-ts
 * import { ScrollingModule } from '@angular/cdk/scrolling';
 * import { Component } from '@angular/core';
 * import { SizeFnVirtualScroll } from '@signality/cdk-interop';
 *
 * @Component({
 *   template: `
 *     <cdk-virtual-scroll-viewport [itemSizeFn]="itemSizeFn" [gap]="gap">
 *       <div
 *         *cdkVirtualFor="let item of items; let i = index; let last = last"
 *         [style.height.px]="itemSizeFn(i)"
 *         [style.margin-bottom.px]="last ? 0 : gap"
 *       >
 *         {{ item }}
 *       </div>
 *     </cdk-virtual-scroll-viewport>
 *   `,
 *   imports: [ScrollingModule, SizeFnVirtualScroll],
 * })
 * export class FocusDemo {
 *   protected readonly items = Array.from({ length: 100_000 }).map((_, i) => `Item #${i}`);
 *   protected readonly gap = 10;
 *   protected readonly itemSizeFn = (index: number) => (index % 2 === 0 ? 50 : 30);
 * }
 * ```
 */
@Directive({
  selector: 'cdk-virtual-scroll-viewport[itemSizeFn]',
  providers: [
    {
      provide: VIRTUAL_SCROLL_STRATEGY,
      useFactory: () => inject(SizeFnVirtualScroll)._scrollStrategy,
    },
  ],
})
export class SizeFnVirtualScroll {
  private readonly defaultItemSizeFn: VirtualScrollItemSizeFn = () => 20;
  private readonly defaultMinBufferPx = 100;
  private readonly defaultMaxBufferPx = 200;

  readonly itemSizeFn = input(this.defaultItemSizeFn);
  readonly gap = input(0, { transform: numberAttribute });
  readonly paddingTop = input(0, { transform: numberAttribute });
  readonly paddingBottom = input(0, { transform: numberAttribute });
  readonly minBufferPx = input(this.defaultMinBufferPx, { transform: numberAttribute });
  readonly maxBufferPx = input(this.defaultMaxBufferPx, { transform: numberAttribute });

  private readonly totalItemSizeFn = computed((): VirtualScrollItemSizeFn => {
    const itemSizeFn = this.itemSizeFn();
    const gap = this.gap();
    const paddingTop = this.paddingTop();
    const paddingBottom = this.paddingBottom();

    return (index, dataLength) => {
      const initialSize = itemSizeFn(index, dataLength);

      if (index === 0) {
        return paddingTop + initialSize + gap;
      }

      if (index === dataLength - 1) {
        return initialSize + paddingBottom;
      }

      return initialSize + gap;
    };
  });

  /**
   * @internal
   */
  readonly _scrollStrategy = new SizeFnVirtualScrollStrategy(
    this.defaultItemSizeFn,
    this.defaultMinBufferPx,
    this.defaultMaxBufferPx
  );

  constructor() {
    effect(() =>
      this._scrollStrategy.updateItemAndBufferSize(
        this.totalItemSizeFn(),
        this.minBufferPx(),
        this.maxBufferPx()
      )
    );
  }
}

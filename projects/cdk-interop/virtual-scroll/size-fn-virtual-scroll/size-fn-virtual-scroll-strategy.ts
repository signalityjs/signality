/**
 * Based on:
 * https://github.com/angular/components/blob/main/src/cdk/scrolling/fixed-size-virtual-scroll.ts
 */

import type { CdkVirtualScrollViewport, VirtualScrollStrategy } from '@angular/cdk/scrolling';
import { distinctUntilChanged, Subject } from 'rxjs';
import type { VirtualScrollItemSizeFn } from './virtual-scroll-item-size-fn';

export class SizeFnVirtualScrollStrategy implements VirtualScrollStrategy {
  private readonly _scrolledIndexChange = new Subject<number>();

  readonly scrolledIndexChange = this._scrolledIndexChange.pipe(distinctUntilChanged());

  private viewport: CdkVirtualScrollViewport | undefined = undefined;

  constructor(
    private itemSizeFn: VirtualScrollItemSizeFn,
    private minBufferPx: number,
    private maxBufferPx: number
  ) {}

  attach(viewport: CdkVirtualScrollViewport): void {
    this.viewport = viewport;

    this.updateTotalContentSize();
    this.updateRenderedRange();
  }

  detach(): void {
    this._scrolledIndexChange.complete();
    this.viewport = undefined;
  }

  updateItemAndBufferSize(
    itemSizeFn: VirtualScrollItemSizeFn,
    minBufferPx: number,
    maxBufferPx: number
  ) {
    this.itemSizeFn = itemSizeFn;
    this.minBufferPx = minBufferPx;
    this.maxBufferPx = maxBufferPx;

    this.updateTotalContentSize();
    this.updateRenderedRange();
  }

  onContentScrolled(): void {
    this.updateRenderedRange();
  }

  onDataLengthChanged(): void {
    this.updateTotalContentSize();
    this.updateRenderedRange();
  }

  onContentRendered(): void {
    // no-op
  }

  onRenderedOffsetChanged(): void {
    // no-op
  }

  scrollToIndex(index: number, behavior: ScrollBehavior): void {
    if (!this.viewport) {
      return;
    }

    this.viewport.scrollToOffset(this.findOffsetToIndex(index, this.viewport), behavior);
  }

  private updateTotalContentSize() {
    if (!this.viewport) {
      return;
    }

    this.viewport.setTotalContentSize(
      this.findOffsetToIndex(this.viewport.getDataLength(), this.viewport)
    );
  }

  private updateRenderedRange() {
    if (!this.viewport) {
      return;
    }

    const renderedRange = this.viewport.getRenderedRange();
    const newRange = { start: renderedRange.start, end: renderedRange.end };
    const viewportSize = this.viewport.getViewportSize();
    const dataLength = this.viewport.getDataLength();
    let scrollOffset = this.viewport.measureScrollOffset();

    let firstVisibleIndex = this.findIndexByOffset(scrollOffset, this.viewport);

    if (newRange.end > dataLength) {
      const newVisibleIndex = Math.max(
        0,
        Math.min(firstVisibleIndex, this.indexBeforeSize(dataLength, viewportSize, this.viewport))
      );

      if (firstVisibleIndex !== newVisibleIndex) {
        firstVisibleIndex = newVisibleIndex;
        scrollOffset = this.findOffsetToIndex(firstVisibleIndex, this.viewport);
        newRange.start = firstVisibleIndex;
      }

      newRange.end = Math.min(
        dataLength,
        this.indexAfterSize(newRange.start, viewportSize, this.viewport)
      );
    }

    const startBuffer = scrollOffset - this.findOffsetToIndex(newRange.start, this.viewport);

    if (startBuffer < this.minBufferPx && newRange.start !== 0) {
      newRange.start = this.indexBeforeSize(
        newRange.start,
        this.maxBufferPx - startBuffer,
        this.viewport
      );

      newRange.end = Math.min(
        dataLength,
        this.indexAfterSize(firstVisibleIndex, viewportSize + this.minBufferPx, this.viewport)
      );
    } else {
      const endBuffer =
        this.findOffsetToIndex(newRange.end, this.viewport) - (scrollOffset + viewportSize);

      if (endBuffer < this.minBufferPx && newRange.end !== dataLength) {
        newRange.end = Math.min(
          dataLength,
          this.indexAfterSize(newRange.end, this.maxBufferPx - endBuffer, this.viewport)
        );

        newRange.start = Math.max(
          0,
          this.indexBeforeSize(firstVisibleIndex, this.minBufferPx, this.viewport)
        );
      }
    }

    this.viewport.setRenderedRange(newRange);
    this.viewport.setRenderedContentOffset(this.findOffsetToIndex(newRange.start, this.viewport));
    this._scrolledIndexChange.next(firstVisibleIndex);
  }

  /**
   * Find which index is {@link offset} size away from the first index
   */
  private findIndexByOffset(offset: number, viewport: CdkVirtualScrollViewport) {
    const dataLength = viewport.getDataLength();
    let accumulatedOffset = 0;

    for (let i = 0; i < dataLength; i++) {
      accumulatedOffset += this.itemSizeFn(i, dataLength);

      if (accumulatedOffset > offset) {
        return i;
      }
    }

    return Math.max(0, dataLength - 1);
  }

  /**
   * Find the total size between the first item and the item in {@link index}
   */
  private findOffsetToIndex(index: number, viewport: CdkVirtualScrollViewport) {
    const dataLength = viewport.getDataLength();
    let offset = 0;

    for (let i = 0; i < index; i++) {
      offset += this.itemSizeFn(i, dataLength);
    }

    return offset;
  }

  /**
   * Find which index after {@link fromIndex} is {@link size} away from it
   */
  private indexAfterSize(
    fromIndex: number,
    size: number,
    viewport: CdkVirtualScrollViewport
  ): number {
    const dataLength = viewport.getDataLength();
    let covered = 0;
    let i = fromIndex;

    while (i < dataLength && covered < size) {
      covered += this.itemSizeFn(i++, dataLength);
    }

    return i;
  }

  /**
   * Find which index before {@link fromIndex} is {@link size} away from it
   */
  private indexBeforeSize(
    fromIndex: number,
    size: number,
    viewport: CdkVirtualScrollViewport
  ): number {
    const dataLength = viewport.getDataLength();
    let covered = 0;
    let i = fromIndex;

    while (i > 0 && covered < size) {
      covered += this.itemSizeFn(--i, dataLength);
    }

    return i;
  }
}

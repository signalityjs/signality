import { type CreateSignalOptions, signal, type Signal } from '@angular/core';
import { constSignal, setupContext, toValue } from '@signality/core/internal';
import type { MaybeElementSignal, MaybeSignal, WithInjector } from '@signality/core/types';
import { resizeObserver } from '@signality/core/observers/resize-observer';
import { onDisconnect } from '@signality/core/elements/on-disconnect';

export interface ElementSizeValue {
  readonly width: number;
  readonly height: number;
  readonly contentWidth: number;
  readonly contentHeight: number;
  readonly borderBoxWidth: number;
  readonly borderBoxHeight: number;
}

export interface ElementSizeOptions extends CreateSignalOptions<ElementSizeValue>, WithInjector {
  /**
   * Which box model to observe. Can be a reactive signal.
   * @default 'border-box'
   */
  readonly box?: MaybeSignal<ResizeObserverBoxOptions>;
}

/**
 * Signal-based wrapper around the [ResizeObserver API](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver).
 *
 * @param target - The element to observe
 * @param options - Optional configuration including signal options (equal, debugName), box model, and injector
 * @returns A signal containing the current element dimensions
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     <div #box>
 *       Size: {{ size().width }} × {{ size().height }}px
 *     </div>
 *   `
 * })
 * class ElementSizeDemo {
 *   readonly box = viewChild<ElementRef>('box');
 *   readonly size = elementSize(this.box);
 * }
 * ```
 */
export function elementSize(
  target: MaybeElementSignal<HTMLElement>,
  options?: ElementSizeOptions
): Signal<ElementSizeValue> {
  const { runInContext } = setupContext(options?.injector, elementSize);

  return runInContext(({ isServer }) => {
    if (isServer) {
      return constSignal(DEFAULT_SIZE);
    }

    const size = signal<ElementSizeValue>(DEFAULT_SIZE, options);

    const updateSize = ([entry]: readonly ResizeObserverEntry[]) => {
      const contentBoxSize = entry.contentBoxSize?.[0];
      const borderBoxSize = entry.borderBoxSize?.[0];

      const contentWidth = contentBoxSize?.inlineSize ?? entry.contentRect.width;
      const contentHeight = contentBoxSize?.blockSize ?? entry.contentRect.height;
      const borderBoxWidth = borderBoxSize?.inlineSize ?? entry.contentRect.width;
      const borderBoxHeight = borderBoxSize?.blockSize ?? entry.contentRect.height;

      const box = toValue(options?.box) ?? 'border-box';
      const width = box === 'content-box' ? contentWidth : borderBoxWidth;
      const height = box === 'content-box' ? contentHeight : borderBoxHeight;

      size.set({
        width,
        height,
        contentWidth,
        contentHeight,
        borderBoxWidth,
        borderBoxHeight,
      });
    };

    resizeObserver(target, updateSize, options);

    onDisconnect(target, () => size.set(DEFAULT_SIZE));

    return size;
  });
}

const DEFAULT_SIZE: ElementSizeValue = {
  width: 0,
  height: 0,
  contentWidth: 0,
  contentHeight: 0,
  borderBoxWidth: 0,
  borderBoxHeight: 0,
};

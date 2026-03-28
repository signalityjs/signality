import { type CreateSignalOptions, signal, type Signal } from '@angular/core';
import { constSignal, setupContext, toValue } from '@signality/core/internal';
import type { MaybeElementSignal, MaybeSignal, WithInjector } from '@signality/core/types';
import { resizeObserver } from '@signality/core/observers/resize-observer';
import { onDisconnect } from '@signality/core/elements/on-disconnect';

export interface ElementSizeValue {
  readonly width: number;
  readonly height: number;
}

export interface ElementSizeOptions extends CreateSignalOptions<ElementSizeValue>, WithInjector {
  /**
   * Which box model to observe. Can be a reactive signal.
   *
   * @default 'border-box'
   */
  readonly box?: MaybeSignal<ResizeObserverBoxOptions>;

  /**
   * Initial value for SSR and before the first measurement.
   *
   * @default { width: 0, height: 0 }
   */
  readonly initialValue?: ElementSizeValue;
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
 * export class ElementSizeDemo {
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
  const initialValue = options?.initialValue ?? DEFAULT_SIZE;

  return runInContext(({ isServer }) => {
    if (isServer) {
      return constSignal(initialValue);
    }

    const size = signal<ElementSizeValue>(initialValue, options);

    const updateSize = ([entry]: readonly ResizeObserverEntry[]) => {
      const box = toValue(options?.box) ?? 'border-box';

      if (box === 'content-box') {
        const contentBoxSize = entry.contentBoxSize?.[0];
        size.set({
          width: contentBoxSize?.inlineSize ?? entry.contentRect.width,
          height: contentBoxSize?.blockSize ?? entry.contentRect.height,
        });
      } else {
        const borderBoxSize = entry.borderBoxSize?.[0];
        size.set({
          width: borderBoxSize?.inlineSize ?? entry.contentRect.width,
          height: borderBoxSize?.blockSize ?? entry.contentRect.height,
        });
      }
    };

    resizeObserver(target, updateSize, options);

    onDisconnect(target, () => size.set(DEFAULT_SIZE));

    return size;
  });
}

const DEFAULT_SIZE: ElementSizeValue = {
  width: 0,
  height: 0,
};

import {
  afterRenderEffect,
  type CreateEffectOptions,
  type EffectCleanupRegisterFn,
} from '@angular/core';
import { NOOP_EFFECT_REF, setupContext, toElement, toValue } from '@signality/core/internal';
import type { MaybeElementSignal, MaybeSignal } from '@signality/core/types';

export interface ResizeObserverInitOptions extends Omit<CreateEffectOptions, 'allowSignalWrites'> {
  readonly box?: MaybeSignal<ResizeObserverBoxOptions>;
}

export interface ResizeObserverRef {
  readonly destroy: () => void;
}

/**
 * Low-level utility for observing element size changes using the [ResizeObserver API](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver).
 * Provides fine-grained control over the observation lifecycle.
 *
 * @param target - Element(s) to observe
 * @param callback - Callback function called when element size changes
 * @param options - Optional configuration (see {@link ResizeObserverInitOptions})
 * @returns ResizeObserverRef with a `destroy()` method to stop observing the element(s)
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     <div #resizable>
 *       Size: {{ size().width }} × {{ size().height }}px
 *     </div>
 *   `
 * })
 * class ResizeComponent {
 *   readonly resizable = viewChild<ElementRef>('resizable');
 *   readonly size = signal({ width: 0, height: 0 });
 *
 *   constructor() {
 *     resizeObserver(this.resizable, entries => {
 *       const { width, height } = entries[0].contentRect;
 *       this.size.set({ width, height });
 *     });
 *   }
 * }
 * ```
 */
export function resizeObserver(
  target: MaybeElementSignal<Element> | MaybeElementSignal<Element>[],
  callback: (entries: readonly ResizeObserverEntry[]) => void,
  options?: ResizeObserverInitOptions
): ResizeObserverRef {
  const { runInContext } = setupContext(options?.injector, resizeObserver);

  return runInContext(({ isServer, onCleanup }) => {
    if (isServer) {
      return NOOP_EFFECT_REF;
    }

    const targets = Array.isArray(target) ? target : [target];

    let observer: ResizeObserver | null = null;

    const setupObserver = (onCleanup: EffectCleanupRegisterFn) => {
      const els = targets.map(toElement).filter(Boolean);

      if (!els.length) {
        return;
      }

      const box = toValue(options?.box);

      observer ??= new ResizeObserver(callback);

      for (const el of els) {
        observer.observe(el!, { box });
      }

      onCleanup(() => {
        els.forEach(el => observer?.unobserve(el!));
      });
    };

    const destroy = () => observer?.disconnect();

    onCleanup(destroy);

    afterRenderEffect({ read: setupObserver }, options);

    return { destroy };
  });
}

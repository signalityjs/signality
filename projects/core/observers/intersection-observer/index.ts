import {
  afterRenderEffect,
  type CreateEffectOptions,
  type EffectCleanupRegisterFn,
} from '@angular/core';
import {
  assertElement,
  NOOP_EFFECT_REF,
  setupContext,
  toElement,
  toValue,
} from '@signality/core/internal';
import type { MaybeElementSignal, MaybeSignal } from '@signality/core/types';

export interface IntersectionObserverInitOptions
  extends Omit<CreateEffectOptions, 'allowSignalWrites'> {
  /**
   * Scrollable ancestor used as the intersection viewport.
   * `null` or `undefined` defaults to the browser viewport.
   *
   * @see [IntersectionObserver: root on MDN](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/root)
   */
  readonly root?: MaybeElementSignal<Element> | Document | null;

  /**
   * CSS margin applied around the root before computing intersections.
   * Accepts values in the same format as the CSS `margin` property (e.g. `'10px 0px'`).
   *
   * @see [IntersectionObserver: rootMargin on MDN](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/rootMargin)
   */
  readonly rootMargin?: MaybeSignal<string>;

  /**
   * Fraction(s) of the target element that must be visible to trigger the callback.
   * A single number or an array of thresholds, each between `0` and `1`.
   *
   * @see [IntersectionObserver: thresholds on MDN](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/thresholds)
   */
  readonly threshold?: MaybeSignal<number | number[]>;
}

export interface IntersectionObserverRef {
  /**
   * Stop observing all targets and disconnect the underlying `IntersectionObserver`.
   */
  readonly destroy: () => void;
}

/**
 * Low-level utility for observing element intersection with viewport using the [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API).
 * Provides fine-grained control over the observation lifecycle.
 *
 * @param target - Element(s) to observe
 * @param callback - Callback function called when intersection changes
 * @param options - Optional configuration (see {@link IntersectionObserverInitOptions})
 * @returns An IntersectionObserverRef with a `destroy()` method to stop observing the element(s)
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     <div #section>Section content</div>
 *     @if (isVisible()) {
 *       <p>Section is visible!</p>
 *     }
 *   `
 * })
 * export class IntersectionDemo {
 *   readonly section = viewChild<ElementRef>('section');
 *   readonly isVisible = signal(false);
 *
 *   constructor() {
 *     intersectionObserver(this.section, entries => {
 *       this.isVisible.set(entries[0].isIntersecting);
 *     }, { threshold: 0.5 });
 *   }
 * }
 * ```
 */
export function intersectionObserver(
  target: MaybeElementSignal<Element> | MaybeElementSignal<Element>[],
  callback: (entries: readonly IntersectionObserverEntry[], observer: IntersectionObserver) => void,
  options?: IntersectionObserverInitOptions
): IntersectionObserverRef {
  const { runInContext } = setupContext(options?.injector, intersectionObserver);

  return runInContext(({ isServer }) => {
    if (isServer) {
      return NOOP_EFFECT_REF;
    }

    const targets = Array.isArray(target) ? target : [target];

    const setupObserver = (onCleanup: EffectCleanupRegisterFn) => {
      const els = targets.map(toElement).filter(Boolean);

      if (!els.length) {
        return;
      }

      const root = options?.root
        ? options.root instanceof Document
          ? options.root
          : toElement(options.root)
        : null;
      const rootMargin = toValue(options?.rootMargin);
      const threshold = toValue(options?.threshold);

      const observer = new IntersectionObserver(callback, { root, rootMargin, threshold });

      for (const el of els) {
        ngDevMode && assertElement(el, 'intersectionObserver');
        observer.observe(el!);
      }

      onCleanup(observer.disconnect.bind(observer));
    };

    const effectRef = afterRenderEffect({ read: setupObserver }, options);

    return { destroy: () => effectRef.destroy() };
  });
}

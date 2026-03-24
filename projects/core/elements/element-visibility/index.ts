import { type CreateSignalOptions, type Signal, signal } from '@angular/core';
import { constSignal, setupContext } from '@signality/core/internal';
import type { MaybeElementSignal, MaybeSignal, WithInjector } from '@signality/core/types';
import { intersectionObserver } from '@signality/core/observers/intersection-observer';
import { onDisconnect } from '@signality/core/elements/on-disconnect';

export interface ElementVisibilityOptions
  extends CreateSignalOptions<ElementVisibilityValue>,
    WithInjector {
  /**
   * Fraction of the element that must be visible to trigger a change.
   * A single number or an array of thresholds, each between `0` and `1`.
   *
   * @default 0
   * @see [IntersectionObserver: thresholds on MDN](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/thresholds)
   */
  readonly threshold?: MaybeSignal<number | number[]>;

  /**
   * Scrollable ancestor used as the viewport for intersection checks.
   * `null` or `undefined` defaults to the browser viewport.
   *
   * @default undefined
   * @see [IntersectionObserver: root on MDN](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/root)
   */
  readonly root?: MaybeElementSignal<Element> | Document;

  /**
   * CSS margin applied around the root before computing intersections.
   * Accepts values in the same format as the CSS `margin` property (e.g. `'10px 0px'`).
   *
   * @default '0px'
   * @see [IntersectionObserver: rootMargin on MDN](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/rootMargin)
   */
  readonly rootMargin?: MaybeSignal<string>;

  /**
   * Initial value for SSR.
   *
   * @default { isVisible: true, ratio: 1 }
   */
  readonly initialValue?: ElementVisibilityValue;
}

export interface ElementVisibilityValue {
  /**
   * Whether the element is currently intersecting the root (visible in the viewport).
   *
   * @see [IntersectionObserverEntry: isIntersecting on MDN](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserverEntry/isIntersecting)
   */
  readonly isVisible: boolean;

  /**
   * Fraction of the element visible within the root, from `0.0` (not visible) to `1.0` (fully visible).
   *
   * @see [IntersectionObserverEntry: intersectionRatio on MDN](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserverEntry/intersectionRatio)
   */
  readonly ratio: number;
}

/**
 * Signal-based wrapper around the [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API).
 *
 * @param target - The element to observe
 * @param options - Optional configuration
 * @returns A signal containing the current visibility state
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     <div #section [class.visible]="visibility().isVisible">
 *       Visibility: {{ visibility().ratio * 100 }}%
 *     </div>
 *   `
 * })
 * export class VisibilityDemo {
 *   readonly section = viewChild<ElementRef>('section');
 *   readonly visibility = elementVisibility(this.section);
 * }
 * ```
 */
export function elementVisibility(
  target: MaybeElementSignal<HTMLElement>,
  options?: ElementVisibilityOptions
): Signal<ElementVisibilityValue> {
  const { runInContext } = setupContext(options?.injector, elementVisibility);
  const initialValue = options?.initialValue ?? { isVisible: true, ratio: 1 };

  return runInContext(({ isServer }) => {
    if (isServer) {
      return constSignal(initialValue);
    }

    const visibility = signal(initialValue, options);

    const threshold = options?.threshold ?? 0;
    const root = options?.root ?? undefined;
    const rootMargin = options?.rootMargin ?? '0px';

    const update = (entries: readonly IntersectionObserverEntry[]) => {
      if (entries.length === 0) {
        return;
      }

      // Find the entry with the latest time to ensure we use the most up-to-date state
      // IntersectionObserver may batch multiple changes and call the callback once
      // with multiple entries, and the order in the array doesn't guarantee
      // that the last entry is the most recent one
      let latestEntry = entries[0];
      let latestTime = entries[0].time;

      for (let i = 1; i < entries.length; i++) {
        const entry = entries[i];
        if (entry.time >= latestTime) {
          latestTime = entry.time;
          latestEntry = entry;
        }
      }

      visibility.set({
        isVisible: latestEntry.isIntersecting,
        ratio: latestEntry.intersectionRatio,
      });
    };

    intersectionObserver(target, update, { threshold, root, rootMargin });

    onDisconnect(target, () => visibility.set({ isVisible: false, ratio: 0 }));

    return visibility;
  });
}

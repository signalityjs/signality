import { type CreateSignalOptions, type Signal, signal } from '@angular/core';
import { constSignal, setupContext } from '@signality/core/internal';
import type { MaybeElementSignal, MaybeSignal, WithInjector } from '@signality/core/types';
import { intersectionObserver } from '@signality/core/observers/intersection-observer';
import { onDisconnect } from '@signality/core/elements/on-disconnect';

export interface ElementVisibilityOptions
  extends CreateSignalOptions<ElementVisibilityValue>,
    WithInjector {
  /**
   * Visibility threshold(s). A number between 0 and 1, or an array of thresholds.
   * @default 0
   */
  readonly threshold?: MaybeSignal<number | number[]>;

  /**
   * Scrollable ancestor element (null = viewport).
   * @default undefined
   */
  readonly root?: MaybeElementSignal<Element> | Document;

  /**
   * Margin around the root element.
   * @default '0px'
   */
  readonly rootMargin?: MaybeSignal<string>;
}

export interface ElementVisibilityValue {
  /** Whether the element is visible in the viewport */
  readonly isVisible: boolean;

  /** Intersection ratio (0.0 to 1.0) */
  readonly ratio: number;
}

/**
 * Signal-based wrapper around the [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API).
 *
 * @param target - The element to observe
 * @param options - Optional configuration including signal options (equal, debugName), observer options, and injector
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
 * class VisibilityComponent {
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

  return runInContext(({ isServer }) => {
    if (isServer) {
      return constSignal(DEFAULT_VISIBILITY);
    }

    const visibility = signal<ElementVisibilityValue>(DEFAULT_VISIBILITY, options);

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

    onDisconnect(target, () => visibility.set(DEFAULT_VISIBILITY));

    return visibility;
  });
}

const DEFAULT_VISIBILITY: ElementVisibilityValue = {
  isVisible: false,
  ratio: 0,
};

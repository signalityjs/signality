import { type Signal, signal } from '@angular/core';
import { constSignal, setupContext } from '@signality/core/internal';
import type { MaybeElementSignal, WithInjector } from '@signality/core/types';
import { listener } from '@signality/core/browser/listener';
import { onDisconnect } from '@signality/core/elements/on-disconnect';

/**
 * Possible swipe direction values.
 */
export type SwipeDirection = 'up' | 'down' | 'left' | 'right' | 'none';

export interface SwipeOptions extends WithInjector {
  /**
   * Minimum distance in pixels before a swipe is recognized.
   * @default 50
   */
  readonly threshold?: number;
}

export interface SwipeRef {
  /** Whether a swipe gesture is currently in progress. */
  readonly isSwiping: Signal<boolean>;

  /** Current swipe direction, or `'none'` if a threshold has not been exceeded. */
  readonly direction: Signal<SwipeDirection>;

  /** Horizontal distance from start (positive = swiped left). */
  readonly distanceX: Signal<number>;

  /** Vertical distance from start (positive = swiped up). */
  readonly distanceY: Signal<number>;
}

/**
 * Reactive touch-swipe detection on an element.
 * Uses Touch Events API — for mouse/pen input use PointerSwipe instead.
 * Tracks single-finger swipe gestures and provides direction and distance signals.
 *
 * @param target - Element to detect swipe gestures on
 * @param options - Optional configuration including threshold and injector
 * @returns A SwipeRef with reactive signals for swipe state
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     <div #area>
 *       <p>Swiping: {{ sw.isSwiping() }}</p>
 *       <p>Direction: {{ sw.direction() }}</p>
 *     </div>
 *   `
 * })
 * export class SwipeComponent {
 *   readonly area = viewChild<ElementRef>('area');
 *   readonly sw = swipe(this.area);
 * }
 * ```
 */
export function swipe(target: MaybeElementSignal<HTMLElement>, options?: SwipeOptions): SwipeRef {
  const { runInContext } = setupContext(options?.injector, swipe);

  return runInContext(({ isServer }) => {
    if (isServer) {
      return {
        isSwiping: constSignal(false),
        direction: constSignal('none'),
        distanceX: constSignal(0),
        distanceY: constSignal(0),
      };
    }

    const threshold = options?.threshold ?? 50;

    const isSwiping = signal(false);
    const direction = signal<SwipeDirection>('none');
    const distanceX = signal(0);
    const distanceY = signal(0);

    let startX = 0;
    let startY = 0;

    listener.passive(target, 'touchstart', (e: TouchEvent) => {
      if (e.touches.length !== 1) {
        return;
      }

      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;

      isSwiping.set(false);
      direction.set('none');
      distanceX.set(0);
      distanceY.set(0);
    });

    listener.passive(target, 'touchmove', (e: TouchEvent) => {
      if (e.touches.length !== 1) {
        return;
      }

      const dx = startX - e.touches[0].clientX;
      const dy = startY - e.touches[0].clientY;

      distanceX.set(dx);
      distanceY.set(dy);

      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      if (Math.max(absDx, absDy) >= threshold) {
        if (!isSwiping()) {
          isSwiping.set(true);
        }

        if (absDx > absDy) {
          direction.set(dx > 0 ? 'left' : 'right');
        } else {
          direction.set(dy > 0 ? 'up' : 'down');
        }
      }
    });

    const onTouchEnd = () => {
      isSwiping.set(false);
    };

    listener.passive(target, 'touchend', onTouchEnd);
    listener.passive(target, 'touchcancel', onTouchEnd);

    onDisconnect(target, () => {
      isSwiping.set(false);
      direction.set('none');
      distanceX.set(0);
      distanceY.set(0);
    });

    return {
      isSwiping: isSwiping.asReadonly(),
      direction: direction.asReadonly(),
      distanceX: distanceX.asReadonly(),
      distanceY: distanceY.asReadonly(),
    };
  });
}

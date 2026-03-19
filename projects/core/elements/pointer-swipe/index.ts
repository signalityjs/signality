import { type Signal, signal } from '@angular/core';
import { constSignal, setupContext } from '@signality/core/internal';
import type { MaybeElementSignal, WithInjector } from '@signality/core/types';
import { listener } from '@signality/core/browser/listener';
import { onDisconnect } from '@signality/core/elements/on-disconnect';

/**
 * Pointer type that triggered the event.
 */
export type PointerType = 'mouse' | 'touch' | 'pen';

/**
 * Possible swipe direction values.
 */
export type PointerSwipeDirection = 'up' | 'down' | 'left' | 'right' | 'none';

export interface PointerSwipeOptions extends WithInjector {
  /**
   * Minimum distance in pixels before a swipe is recognized.
   * @default 50
   */
  readonly threshold?: number;

  /**
   * Pointer types to listen for.
   * @default ['mouse', 'touch', 'pen']
   */
  readonly pointerTypes?: PointerType[];
}

export interface PointerSwipeRef {
  /** Whether a swipe gesture is currently in progress. */
  readonly isSwiping: Signal<boolean>;

  /** Current swipe direction, or `'none'` if a threshold has not been exceeded. */
  readonly direction: Signal<PointerSwipeDirection>;

  /** Horizontal distance from start (positive = swiped left). */
  readonly distanceX: Signal<number>;

  /** Vertical distance from start (positive = swiped up). */
  readonly distanceY: Signal<number>;
}

/**
 * Reactive pointer-swipe detection on an element.
 * Tracks swipe gestures using Pointer Events and provides direction and distance signals.
 * Works with mouse, touch, and pen input.
 *
 * @param target - Element to detect swipe gestures on
 * @param options - Optional configuration including threshold, pointer types, and injector
 * @returns A PointerSwipeRef with reactive signals for swipe state
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
 * export class PointerSwipeComponent {
 *   readonly area = viewChild<ElementRef>('area');
 *   readonly sw = pointerSwipe(this.area);
 * }
 * ```
 */
export function pointerSwipe(
  target: MaybeElementSignal<HTMLElement>,
  options?: PointerSwipeOptions
): PointerSwipeRef {
  const { runInContext } = setupContext(options?.injector, pointerSwipe);

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
    const pointerTypes = options?.pointerTypes;

    const isSwiping = signal(false);
    const direction = signal<PointerSwipeDirection>('none');
    const distanceX = signal(0);
    const distanceY = signal(0);

    let startX = 0;
    let startY = 0;
    let isPointerDown = false;

    function isAllowedPointerType(e: PointerEvent): boolean {
      return !pointerTypes || pointerTypes.includes(e.pointerType as PointerType);
    }

    listener.passive(target, 'pointerdown', (e: PointerEvent) => {
      if (!isAllowedPointerType(e)) {
        return;
      }

      isPointerDown = true;

      (e.target as HTMLElement | undefined)?.setPointerCapture(e.pointerId);

      startX = e.clientX;
      startY = e.clientY;

      isSwiping.set(false);
      direction.set('none');
      distanceX.set(0);
      distanceY.set(0);
    });

    listener.passive(target, 'pointermove', (e: PointerEvent) => {
      if (!isPointerDown || !isAllowedPointerType(e)) {
        return;
      }

      const dx = startX - e.clientX;
      const dy = startY - e.clientY;

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

    const onPointerEnd = () => {
      isPointerDown = false;
      isSwiping.set(false);
    };

    listener.passive(target, 'pointerup', onPointerEnd);
    listener.passive(target, 'pointercancel', onPointerEnd);

    onDisconnect(target, () => {
      isPointerDown = false;
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

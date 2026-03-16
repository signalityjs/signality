import { NOOP_EFFECT_REF, setupContext, type Timer, toValue } from '@signality/core/internal';
import type { MaybeElementSignal, MaybeSignal, WithInjector } from '@signality/core/types';
import { listener } from '@signality/core/browser/listener';

export interface OnLongPressOptions extends WithInjector {
  /**
   * Time in ms before the callback is triggered.
   * @default 500
   */
  readonly delay?: MaybeSignal<number>;

  /**
   * Maximum distance (in pixels) the pointer can move before cancelling.
   * Set to `false` to disable distance checking.
   * @default 10
   */
  readonly distanceThreshold?: number | false;
}

export interface OnLongPressRef {
  readonly destroy: () => void;
}

/**
 * Detect long press gestures on an element.
 * Calls a callback after a configurable delay if the pointer stays down
 * without moving beyond the distance threshold.
 *
 * @param target - The element to detect long presses on
 * @param handler - Callback invoked when a long press is detected
 * @param options - Optional configuration including delay, distance threshold, and injector
 * @returns A OnLongPressRef with a destroy method to stop detection
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `<button #btn>Hold me</button>`
 * })
 * class OnLongPressDemo {
 *   readonly btn = viewChild<ElementRef>('btn');
 *
 *   constructor() {
 *     onLongPress(this.btn, () => {
 *       console.log('Long press detected!');
 *     });
 *   }
 * }
 * ```
 */
export function onLongPress(
  target: MaybeElementSignal<HTMLElement>,
  handler: (event: PointerEvent) => void,
  options?: OnLongPressOptions
): OnLongPressRef {
  const { runInContext } = setupContext(options?.injector, onLongPress);

  return runInContext(({ isServer, onCleanup }) => {
    if (isServer) {
      return NOOP_EFFECT_REF;
    }

    const distanceThreshold = options?.distanceThreshold;

    let startX = 0;
    let startY = 0;
    let longPressTimeout: Timer;

    function abortPendingPress(): void {
      clearTimeout(longPressTimeout);
      longPressTimeout = undefined;
    }

    const downListener = listener(target, 'pointerdown', (e: PointerEvent) => {
      startX = e.clientX;
      startY = e.clientY;

      const delay = toValue(options?.delay) ?? 500;

      longPressTimeout = setTimeout(() => {
        handler(e);
        longPressTimeout = undefined;
      }, delay);
    });

    const moveListener = listener(target, 'pointermove', (e: PointerEvent) => {
      if (!longPressTimeout || distanceThreshold === false) {
        return;
      }

      const threshold = distanceThreshold ?? 10;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      if (Math.sqrt(dx * dx + dy * dy) > threshold) {
        abortPendingPress();
      }
    });

    const upListener = listener(target, 'pointerup', abortPendingPress);
    const leaveListener = listener(target, 'pointerleave', abortPendingPress);

    onCleanup(abortPendingPress);

    return {
      destroy: () => {
        abortPendingPress();
        upListener.destroy();
        downListener.destroy();
        moveListener.destroy();
        leaveListener.destroy();
      },
    };
  });
}

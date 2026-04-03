import type { MaybeSignal, WithInjector } from '@signality/core/types';
import { setupContext, type Timer } from '@signality/core/internal';
import { toValue } from '@signality/core/utilities';

/**
 * Creates a throttled version of a callback function.
 * The callback will be executed at most once per specified wait interval.
 *
 * @param callback - The function to throttle
 * @param wait - Throttle interval in milliseconds (can be a reactive signal)
 * @param options - Optional configuration including injector
 * @returns A throttled version of the callback function
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     <div (scroll)="handleScroll($event)">
 *       Scrollable content
 *     </div>
 *   `,
 * })
 * export class ScrollComponent {
 *   readonly throttleTime = input(300);
 *   readonly scrollChange = output<Event>();
 *
 *   readonly handleScroll = throttleCallback(e => {
 *     this.scrollChange.emit(e);
 *   }, this.throttleTime);
 * }
 * ```
 */
export function throttleCallback<T extends (...args: any[]) => any>(
  callback: T,
  wait: MaybeSignal<number>,
  options?: WithInjector
): T {
  const { runInContext } = setupContext(options?.injector, throttleCallback);

  return runInContext(({ isServer, onCleanup }) => {
    if (isServer) {
      return callback;
    }

    let timer: Timer;
    let isThrottled: boolean;
    let lastArgs: Parameters<T>;

    onCleanup(() => {
      if (timer !== undefined) {
        clearTimeout(timer);
      }
    });

    return new Proxy(callback, {
      apply(target, thisArg, args) {
        lastArgs = args as Parameters<T>;

        if (isThrottled) {
          return;
        }

        target.apply(thisArg, lastArgs);
        isThrottled = true;

        timer = setTimeout(() => {
          isThrottled = false;
        }, toValue.untracked(wait));
      },
    });
  });
}

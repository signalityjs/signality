import type { MaybeSignal, WithInjector } from '@signality/core/types';
import { setupContext, type Timer } from '@signality/core/internal';
import { toValue } from '@signality/core/utilities';

export interface ThrottleCallbackOptions extends WithInjector {
  /**
   * Invoke the callback immediately on the call that opens an interval.
   *
   * When `false`, that call is deferred to the end of the interval instead, so the callback
   * never runs on the event that triggered it.
   *
   * @default true
   */
  readonly leading?: boolean;

  /**
   * Invoke the callback once more when the interval ends, using the arguments of the most
   * recent call made during that interval.
   *
   * When `false`, calls made during the interval are dropped and never delivered, so the
   * callback only ever observes the value that opened each interval.
   *
   * @default true
   */
  readonly trailing?: boolean;
}

/**
 * Creates a throttled version of a callback function.
 * The callback runs immediately on the first call, then at most once per wait interval.
 *
 * @param callback - The function to throttle
 * @param wait - Throttle interval in milliseconds (can be a reactive signal)
 * @param options - Optional configuration including leading, trailing and injector
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
  options?: ThrottleCallbackOptions
): T {
  const { runInContext } = setupContext(options?.injector, throttleCallback);

  return runInContext(({ isServer, onCleanup }) => {
    if (isServer) {
      return callback;
    }

    const leading = options?.leading ?? true;
    const trailing = options?.trailing ?? true;

    if (ngDevMode && !leading && !trailing) {
      console.warn(
        '[throttleCallback] Both `leading` and `trailing` are disabled, so the callback will never run.'
      );
    }

    let timer: Timer;
    let isThrottled = false;
    let hasPendingCall = false;
    let lastArgs: Parameters<T>;
    let lastThis: unknown;

    onCleanup(() => {
      if (timer !== undefined) {
        clearTimeout(timer);
      }
    });

    const startInterval = (target: T) => {
      isThrottled = true;

      timer = setTimeout(() => {
        isThrottled = false;

        if (hasPendingCall) {
          invoke(target);
        }
      }, toValue.untracked(wait));
    };

    const invoke = (target: T) => {
      hasPendingCall = false;

      target.apply(lastThis, lastArgs);

      startInterval(target);
    };

    return new Proxy(callback, {
      apply(target, thisArg, args) {
        lastArgs = args as Parameters<T>;
        lastThis = thisArg;

        if (isThrottled) {
          hasPendingCall = trailing;
          return;
        }

        if (leading) {
          invoke(target);
          return;
        }

        // Without a leading call the interval still opens, so the deferred call lands
        // one interval later instead of immediately.
        hasPendingCall = trailing;
        startInterval(target);
      },
    });
  });
}

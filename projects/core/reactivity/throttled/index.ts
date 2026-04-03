import {
  type CreateSignalOptions,
  isSignal,
  signal,
  type Signal,
  type WritableSignal,
} from '@angular/core';
import { proxySignal, setupContext } from '@signality/core/internal';
import { toValue } from '@signality/core/utilities';
import type { MaybeSignal, SignalValue, WithInjector } from '@signality/core/types';
import { throttleCallback } from '@signality/core/scheduling/throttle-callback';
import { watcher } from '@signality/core/reactivity/watcher';

export type ThrottledOptions<T> = CreateSignalOptions<T> & WithInjector;

/**
 * Creates a throttled readonly signal from a source signal.
 * Updates to the source signal are throttled to occur at most once per time interval.
 *
 * @param source - Source signal to throttle
 * @param timeMs - Throttle interval in milliseconds
 * @param options - Optional configuration including signal options and injector
 * @returns A readonly signal that updates at most once per throttle interval
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     <div (scroll)="scrollY.set($event.target.scrollTop)">
 *       <p>Scroll position: {{ scrollY() }}</p>
 *       <p>Throttled position: {{ throttledScrollY() }}</p>
 *     </div>
 *   `
 * })
 * export class ScrollTracker {
 *   readonly scrollY = signal(0);
 *   readonly throttledScrollY = throttled(this.scrollY, 100);
 * }
 * ```
 */
export function throttled<S extends Signal<any>>(
  source: S,
  timeMs: MaybeSignal<number>,
  options?: ThrottledOptions<SignalValue<S>>
): Signal<SignalValue<S>>;

/**
 * Creates a throttled writable signal from an initial value.
 * Both `set()` and `update()` calls are throttled.
 *
 * @param value - Initial value
 * @param timeMs - Throttle interval in milliseconds
 * @param options - Optional configuration including signal options and injector
 * @returns A writable signal where updates are throttled
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     <div (mousemove)="mousePosition.set({ x: $event.clientX, y: $event.clientY })">
 *       <p>Mouse position: X={{ mousePosition().x }}, Y={{ mousePosition().y }}</p>
 *     </div>
 *   `
 * })
 * export class MouseTracker {
 *   readonly mousePosition = throttled({ x: 0, y: 0 }, 16);
 * }
 * ```
 */
export function throttled<V>(
  value: V,
  timeMs: MaybeSignal<number>,
  options?: ThrottledOptions<V>
): WritableSignal<V>;

export function throttled(
  valueOrSignal: any,
  timeMs: MaybeSignal<number>,
  options?: ThrottledOptions<any>
) {
  const { runInContext } = setupContext(options?.injector, throttled);

  return runInContext(() => {
    const initialValue = toValue(valueOrSignal);
    const output = signal(initialValue, options);
    const set = throttleCallback(output.set, timeMs);

    if (isSignal(valueOrSignal)) {
      watcher(valueOrSignal, set);
      return output.asReadonly();
    } else {
      return proxySignal(output, { set });
    }
  });
}

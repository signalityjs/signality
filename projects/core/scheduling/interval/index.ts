import { isSignal } from '@angular/core';
import { NOOP_EFFECT_REF, setupContext, type Timer, toValue } from '@signality/core/internal';
import type { MaybeSignal, WithInjector } from '@signality/core/types';
import { watcher } from '@signality/core/reactivity/watcher';

export interface IntervalOptions extends WithInjector {
  /**
   * Call the callback immediately, without waiting for the first tick.
   *
   * @default false
   */
  readonly immediate?: boolean;
}

export interface IntervalRef {
  /**
   * Stop the interval permanently.
   */
  readonly destroy: () => void;
}

/**
 * Signal-based wrapper around [`setInterval`](https://developer.mozilla.org/en-US/docs/Web/API/Window/setInterval).
 * Creates a reactive interval that executes a callback at specified intervals.
 * The interval starts immediately upon creation and can be stopped with `destroy()`.
 *
 * @param callback - Function to execute on each interval tick
 * @param intervalMs - Interval duration in milliseconds (can be a reactive signal)
 * @param options - Optional configuration
 * @returns An IntervalRef with a `destroy` method to stop the interval
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     <p>Ticks: {{ ticks() }}</p>
 *     <button (click)="polling.destroy()">Stop</button>
 *   `,
 * })
 * export class PeriodicTask {
 *   readonly ticks = signal(0);
 *
 *   readonly polling = interval(() => {
 *     this.ticks.update(n => n + 1);
 *   }, 5000);
 * }
 * ```
 */
export function interval(
  callback: () => void,
  intervalMs: MaybeSignal<number>,
  options?: IntervalOptions
): IntervalRef {
  const { runInContext } = setupContext(options?.injector, interval);

  return runInContext(({ isServer, onCleanup }) => {
    if (isServer) {
      return NOOP_EFFECT_REF;
    }

    let intervalId: Timer;

    const start = () => {
      clearInterval(intervalId);

      const ms = toValue.untracked(intervalMs);
      intervalId = ms > 0 ? setInterval(callback, ms) : undefined;
    };

    if (isSignal(intervalMs)) {
      watcher(intervalMs, start);
    }

    const destroy = () => {
      clearInterval(intervalId);
      intervalId = undefined;
    };

    onCleanup(destroy);

    if (options?.immediate) {
      callback();
    }

    start();

    return { destroy };
  });
}

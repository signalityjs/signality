import { isSignal, signal, type Signal, untracked } from '@angular/core';
import { constSignal, NOOP_FN, setupContext, type Timer, toValue } from '@signality/core/internal';
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
   * Whether the interval is currently running.
   */
  readonly isActive: Signal<boolean>;

  /**
   * Stop the interval permanently.
   */
  readonly stop: () => void;
}

/**
 * Signal-based wrapper around [`setInterval`](https://developer.mozilla.org/en-US/docs/Web/API/Window/setInterval).
 * Creates a reactive interval that executes a callback at specified intervals.
 * The interval starts immediately upon creation and can be stopped with `stop()`.
 *
 * @param callback - Function to execute on each interval tick
 * @param intervalMs - Interval duration in milliseconds (can be a reactive signal)
 * @param options - Optional configuration
 * @returns An IntervalRef with `isActive` signal and `stop` method
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     <p>Status: {{ polling.isActive() ? 'Polling' : 'Stopped' }}</p>
 *     <button (click)="polling.stop()">Stop</button>
 *   `,
 * })
 * export class PeriodicTask {
 *   readonly polling = interval(async () => {
 *     await this.checkStatus();
 *   }, 5000);
 *
 *   async checkStatus() {
 *     // async operation
 *   }
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
      return {
        isActive: constSignal(false),
        stop: NOOP_FN,
      };
    }

    const isActive = signal(true);

    let intervalId: Timer;

    const cleanup = () => {
      if (intervalId !== undefined) {
        clearInterval(intervalId);
        intervalId = undefined;
      }
    };

    const start = () => {
      cleanup();

      const ms = toValue.untracked(intervalMs);
      if (ms <= 0) return;

      intervalId = setInterval(callback, ms);
    };

    const stop = () => {
      isActive.set(false);
      cleanup();
    };

    if (isSignal(intervalMs)) {
      watcher(intervalMs, () => {
        if (untracked(isActive)) {
          start();
        }
      });
    }

    onCleanup(stop);

    if (options?.immediate) {
      callback();
    }

    start();

    return {
      isActive: isActive.asReadonly(),
      stop,
    };
  });
}

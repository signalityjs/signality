import { isSignal, signal, type Signal, untracked } from '@angular/core';
import { constSignal, NOOP_FN, setupContext, type Timer, toValue } from '@signality/core/internal';
import type { MaybeSignal, WithInjector } from '@signality/core/types';
import { watcher } from '@signality/core/reactivity/watcher';

export interface IntervalOptions extends WithInjector {
  /**
   * Whether to start the interval immediately.
   * @default false
   */
  readonly immediate?: boolean;
}

export interface IntervalRef {
  /** Whether the interval is currently active */
  readonly isActive: Signal<boolean>;

  /** Number of times the callback has been executed */
  readonly counter: Signal<number>;

  /** Pause the interval */
  readonly pause: () => void;

  /** Resume the interval */
  readonly resume: () => void;

  /** Reset the counter to 0 */
  readonly reset: () => void;
}

/**
 * Creates a reactive interval that executes a callback function at specified intervals.
 * Automatically handles cleanup and supports reactive interval duration.
 *
 * @param callback - Function to execute on each interval tick, receives current counter value
 * @param intervalMs - Interval duration in milliseconds (can be a reactive signal)
 * @param options - Optional configuration including immediate start and injector
 * @returns An IntervalRef with control methods and state signals
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     <p>Status: {{ polling.isActive() ? 'Polling' : 'Stopped' }}</p>
 *     <button (click)="polling.pause()">Stop</button>
 *     <button (click)="polling.resume()">Start</button>
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
  callback: (counter: number) => void,
  intervalMs: MaybeSignal<number>,
  options?: IntervalOptions
): IntervalRef {
  const { runInContext } = setupContext(options?.injector, interval);

  return runInContext(({ isServer, onCleanup }) => {
    if (isServer) {
      return {
        isActive: constSignal(false),
        counter: constSignal(0),
        pause: NOOP_FN,
        resume: NOOP_FN,
        reset: NOOP_FN,
      };
    }

    const isActive = signal(false);
    const counter = signal(0);

    let intervalId: Timer;

    const start = () => {
      untracked(() => {
        if (intervalId !== undefined || !isActive()) {
          return;
        }

        const ms = toValue(intervalMs);

        intervalId = setInterval(() => {
          const currentCounter = counter() + 1;
          counter.set(currentCounter);
          callback(currentCounter);
        }, ms);
      });
    };

    const pause = () => {
      cleanup();
      isActive.set(false);
    };

    const cleanup = () => {
      if (intervalId !== undefined) {
        clearInterval(intervalId);
        intervalId = undefined;
      }
    };

    const resume = () => {
      if (intervalId !== undefined) {
        return;
      }

      isActive.set(true);
      start();
    };

    const reset = () => {
      counter.set(0);
    };

    if (isSignal(intervalMs)) {
      watcher(intervalMs, newMs => {
        if (isActive() && newMs !== undefined) {
          cleanup();
          start();
        }
      });
    }

    onCleanup(cleanup);

    if (options?.immediate) {
      isActive.set(true);
      start();
    }

    return {
      isActive: isActive.asReadonly(),
      counter: counter.asReadonly(),
      pause,
      resume,
      reset,
    };
  });
}

import { type Signal, signal, untracked } from '@angular/core';
import { constSignal, createToken, NOOP_FN, setupContext } from '@signality/core/internal';
import type { WithInjector } from '@signality/core/types';

export interface FpsMonitorOptions extends WithInjector {
  /**
   * Start monitoring immediately.
   * @default true
   */
  readonly immediate?: boolean;

  /**
   * Number of frames to average.
   * @default 60
   */
  readonly sampleSize?: number;
}

export interface FpsMonitorRef {
  /** Current frames per second */
  readonly value: Signal<number>;

  /** Whether monitoring is active */
  readonly isRunning: Signal<boolean>;

  /** Start FPS monitoring */
  readonly start: () => void;

  /** Stop FPS monitoring */
  readonly stop: () => void;
}

/**
 * Reactive FPS monitor using requestAnimationFrame.
 *
 * @param options - Configuration options
 * @returns An {@link FpsMonitorRef} with a `value` signal and control methods
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     <p>FPS: {{ monitor.value() }}</p>
 *     <button (click)="monitor.stop()">Stop</button>
 *     <button (click)="monitor.start()">Start</button>
 *   `
 * })
 * export class FpsDisplay {
 *   readonly monitor = fpsMonitor();
 * }
 * ```
 */
export function fpsMonitor(options?: FpsMonitorOptions): FpsMonitorRef {
  const { runInContext } = setupContext(options?.injector, fpsMonitor);

  return runInContext(({ isServer, onCleanup }) => {
    if (isServer) {
      return {
        value: constSignal(0),
        isRunning: constSignal(false),
        start: NOOP_FN,
        stop: NOOP_FN,
      };
    }

    const immediate = options?.immediate ?? true;
    const requestedSampleSize = options?.sampleSize ?? 60;

    // A window smaller than one frame empties the buffer on every frame, which turns
    // the average into 0 / 0.
    const sampleSize = Math.max(1, requestedSampleSize);

    if (ngDevMode && requestedSampleSize < 1) {
      console.warn(
        `[fpsMonitor] \`sampleSize\` must be at least 1, received ${requestedSampleSize}. Falling back to 1.`
      );
    }

    const value = signal(0);
    const isRunning = signal(false);

    let frameId: number | undefined;
    let lastTime = performance.now();
    let frameCount = 0;
    let frameTimes: number[] = [];

    const loop = (currentTime: number) => {
      const delta = currentTime - lastTime;
      lastTime = currentTime;

      if (delta > 0) {
        frameTimes.push(1000 / delta);

        if (frameTimes.length > sampleSize) {
          frameTimes.shift();
        }

        frameCount++;

        if (frameCount >= 10) {
          const avgFps = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
          value.set(Math.round(avgFps));
          frameCount = 0;
        }
      }

      if (untracked(isRunning)) {
        frameId = requestAnimationFrame(loop);
      }
    };

    const start = () => {
      const running = untracked(isRunning);

      if (running) {
        return;
      }

      isRunning.set(true);
      lastTime = performance.now();
      frameCount = 0;
      frameTimes = [];
      frameId = requestAnimationFrame(loop);
    };

    const stop = () => {
      const running = untracked(isRunning);

      if (!running) {
        return;
      }

      isRunning.set(false);

      if (frameId !== undefined) {
        cancelAnimationFrame(frameId);
        frameId = undefined;
      }
    };

    if (immediate) {
      start();
    }

    onCleanup(stop);

    return {
      value: value.asReadonly(),
      isRunning: isRunning.asReadonly(),
      start,
      stop,
    };
  });
}

export const FPS_MONITOR = /* @__PURE__ */ createToken(fpsMonitor);

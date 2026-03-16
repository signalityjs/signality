import { type Signal, signal, untracked } from '@angular/core';
import { constSignal, createToken, NOOP_FN, setupContext } from '@signality/core/internal';
import type { WithInjector } from '@signality/core/types';

export interface FpsOptions extends WithInjector {
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

export interface FpsRef {
  /** Current frames per second */
  readonly fps: Signal<number>;

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
 * @returns An FpsRef with fps signal and control methods
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     <p>FPS: {{ fpsMonitor.fps() }}</p>
 *     <button (click)="fpsMonitor.stop()">Stop</button>
 *     <button (click)="fpsMonitor.start()">Start</button>
 *   `
 * })
 * class FpsMonitor {
 *   readonly fpsMonitor = fps();
 * }
 * ```
 */
export function fps(options?: FpsOptions): FpsRef {
  const { runInContext } = setupContext(options?.injector, fps);

  return runInContext(({ isServer, onCleanup }) => {
    if (isServer) {
      return {
        fps: constSignal(0),
        isRunning: constSignal(false),
        start: NOOP_FN,
        stop: NOOP_FN,
      };
    }

    const immediate = options?.immediate ?? true;
    const sampleSize = options?.sampleSize ?? 60;

    const fpsValue = signal(0);
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
          fpsValue.set(Math.round(avgFps));
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
      fps: fpsValue.asReadonly(),
      isRunning: isRunning.asReadonly(),
      start,
      stop,
    };
  });
}

export const FPS = /* @__PURE__ */ createToken(fps);

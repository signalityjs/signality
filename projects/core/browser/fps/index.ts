import { inject, type Signal } from '@angular/core';
import { createToken } from '@signality/core/internal';
import {
  FPS_MONITOR,
  fpsMonitor,
  type FpsMonitorOptions,
  type FpsMonitorRef,
} from '@signality/core/browser/fps-monitor';

/** @deprecated Use `FpsMonitorOptions` instead. Will be removed in 1.0. */
export type FpsOptions = FpsMonitorOptions;

/** @deprecated Use `FpsMonitorRef` instead. Will be removed in 1.0. */
export interface FpsRef extends FpsMonitorRef {
  /**
   * Current frames per second.
   *
   * @deprecated Use `value` instead. Will be removed in 1.0.
   */
  readonly fps: Signal<number>;
}

/** @deprecated Use `fpsMonitor()` instead. Will be removed in 1.0. */
export function fps(options?: FpsOptions): FpsRef {
  return toFpsRef(fpsMonitor(options));
}

/** @deprecated Use `FPS_MONITOR` instead. Will be removed in 1.0. */
export const FPS = /* @__PURE__ */ createToken(function fps(): FpsRef {
  return toFpsRef(inject(FPS_MONITOR));
});

function toFpsRef(ref: FpsMonitorRef): FpsRef {
  return { ...ref, fps: ref.value };
}

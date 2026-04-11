import { computed, type CreateSignalOptions, type Signal, signal } from '@angular/core';
import { constSignal, createToken, setupContext } from '@signality/core/internal';
import type { WithInjector } from '@signality/core/types';
import { watcher } from '@signality/core/reactivity/watcher';
import { mediaQuery } from '@signality/core/browser/media-query';

export interface DevicePixelRatioOptions extends CreateSignalOptions<number>, WithInjector {
  /**
   * Initial value for SSR.
   * @default 1
   */
  readonly initialValue?: number;
}

/**
 * Signal-based wrapper around the [Window.devicePixelRatio](https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio) property.
 * Tracks changes to the device pixel ratio, which occurs when zooming or moving the window to a display with different pixel density.
 *
 * @param options - Optional configuration including initialValue for SSR
 * @returns A signal containing the current device pixel ratio
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     <p>Device Pixel Ratio: {{ pixelRatio() }}</p>
 *   `
 * })
 * export class PixelRatioDemo {
 *   readonly pixelRatio = devicePixelRatio();
 * }
 * ```
 */
export function devicePixelRatio(options?: DevicePixelRatioOptions): Signal<number> {
  const { runInContext } = setupContext(options?.injector, devicePixelRatio);

  return runInContext(({ isServer }) => {
    if (isServer) {
      return constSignal(options?.initialValue ?? 1);
    }

    const pixelRatio = signal(window.devicePixelRatio, options);

    watcher(mediaQuery(computed(() => `(resolution: ${pixelRatio()}dppx)`)), () => {
      pixelRatio.set(window.devicePixelRatio);
    });

    return pixelRatio.asReadonly();
  });
}

export const DEVICE_PIXEL_RATIO = /* @__PURE__ */ createToken(devicePixelRatio);

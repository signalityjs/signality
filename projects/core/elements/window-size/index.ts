import { afterNextRender, type CreateSignalOptions, type Signal, signal } from '@angular/core';
import { constSignal, createToken, setupContext } from '@signality/core/internal';
import type { WithInjector } from '@signality/core/types';
import { listener } from '@signality/core/browser/listener';
import { watcher } from '@signality/core/reactivity/watcher';
import { mediaQuery } from '@signality/core/browser/media-query';

export interface WindowSizeOptions extends CreateSignalOptions<WindowSizeValue>, WithInjector {
  /**
   * Include scrollbar in dimensions calculation.
   *
   * @default false
   */
  readonly includeScrollbar?: boolean;

  /**
   * Initial value for SSR and before the first measurement.
   *
   * @default { width: 0, height: 0 }
   */
  readonly initialValue?: WindowSizeValue;
}

export interface WindowSizeValue {
  readonly width: number;
  readonly height: number;
}

/**
 * Signal-based wrapper around the [Window API](https://developer.mozilla.org/en-US/docs/Web/API/Window) dimensions.
 *
 * @param options - Optional configuration including initialValue for SSR
 * @returns A signal containing the current window dimensions
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     <div>
 *       Window: {{ size().width }} × {{ size().height }}px
 *       @if (size().width < 768) {
 *         <p>Mobile view</p>
 *       }
 *     </div>
 *   `
 * })
 * class WindowSizeComponent {
 *   readonly size = windowSize();
 * }
 * ```
 */
export function windowSize(options?: WindowSizeOptions): Signal<WindowSizeValue> {
  const { runInContext } = setupContext(options?.injector, windowSize);
  const initialValue = options?.initialValue ?? DEFAULT_VALUE;

  return runInContext(({ isServer }) => {
    if (isServer) {
      return constSignal(initialValue);
    }

    const includeScrollbar = options?.includeScrollbar ?? false;

    const size = signal<WindowSizeValue>(initialValue, options);

    const update = () => {
      const width = includeScrollbar ? window.innerWidth : document.documentElement.clientWidth;
      const height = includeScrollbar ? window.innerHeight : document.documentElement.clientHeight;

      size.set({ width, height });
    };

    listener(window, 'resize', update);

    watcher(mediaQuery('(orientation: portrait)'), update);

    afterNextRender({ read: update });

    return size.asReadonly();
  });
}

export const WINDOW_SIZE = /* @__PURE__ */ createToken(windowSize);

const DEFAULT_VALUE: WindowSizeValue = {
  width: 0,
  height: 0,
};

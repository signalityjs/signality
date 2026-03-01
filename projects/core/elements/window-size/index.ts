import { afterNextRender, type CreateSignalOptions, type Signal, signal } from '@angular/core';
import { constSignal, createToken, setupContext } from '@signality/core/internal';
import type { WithInjector } from '@signality/core/types';
import { listener } from '@signality/core/browser/listener';
import { watcher } from '@signality/core/reactivity/watcher';
import { mediaQuery } from '@signality/core/browser/media-query';

export interface WindowSizeOptions extends CreateSignalOptions<WindowSizeValue>, WithInjector {
  /**
   * Include scrollbar in dimensions calculation.
   * @default false
   */
  readonly includeScrollbar?: boolean;

  /**
   * Initial dimensions for SSR.
   */
  readonly initialValue?: Pick<WindowSizeValue, 'width' | 'height'>;
}

export interface WindowSizeValue {
  readonly width: number;
  readonly height: number;
  readonly innerWidth: number;
  readonly innerHeight: number;
  readonly outerWidth: number;
  readonly outerHeight: number;
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

  return runInContext(({ isServer }) => {
    const initialValue: WindowSizeValue = options?.initialValue
      ? {
          width: options.initialValue.width,
          height: options.initialValue.height,
          innerWidth: options.initialValue.width,
          innerHeight: options.initialValue.height,
          outerWidth: options.initialValue.width,
          outerHeight: options.initialValue.height,
        }
      : DEFAULT_VALUE;

    if (isServer) {
      return constSignal(initialValue);
    }

    const includeScrollbar = options?.includeScrollbar ?? false;

    const size = signal<WindowSizeValue>(initialValue, options);

    const update = () => {
      const width = includeScrollbar ? window.innerWidth : document.documentElement.clientWidth;
      const height = includeScrollbar ? window.innerHeight : document.documentElement.clientHeight;

      size.set({
        width,
        height,
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        outerWidth: window.outerWidth,
        outerHeight: window.outerHeight,
      });
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
  innerWidth: 0,
  innerHeight: 0,
  outerWidth: 0,
  outerHeight: 0,
};

import { afterNextRender, type Signal, signal } from '@angular/core';
import { constSignal, createToken, setupContext } from '@signality/core/internal';
import type { WithInjector } from '@signality/core/types';
import { listener } from '@signality/core/browser/listener';
import { watcher } from '@signality/core/reactivity/watcher';
import { mediaQuery } from '@signality/core/browser/media-query';

export interface WindowSizeOptions extends WithInjector {
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

export interface WindowSizeRef {
  /**
   * Viewport width. Excludes the scrollbar unless `includeScrollbar` is enabled.
   */
  readonly width: Signal<number>;

  /**
   * Viewport height. Excludes the scrollbar unless `includeScrollbar` is enabled.
   */
  readonly height: Signal<number>;
}

/**
 * Signal-based wrapper around the [Window API](https://developer.mozilla.org/en-US/docs/Web/API/Window) dimensions.
 *
 * Width and height are separate signals, so consumers depending on one axis are
 * not invalidated when only the other changes — e.g. a width-based breakpoint is
 * unaffected by the mobile keyboard shrinking the viewport height.
 *
 * @param options - Optional configuration including initialValue for SSR
 * @returns A WindowSizeRef with width and height signals
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     <div>
 *       Window: {{ size.width() }} × {{ size.height() }}px
 *       @if (size.width() < 768) {
 *         <p>Mobile view</p>
 *       }
 *     </div>
 *   `
 * })
 * export class WindowSizeComponent {
 *   readonly size = windowSize();
 * }
 * ```
 */
export function windowSize(options?: WindowSizeOptions): WindowSizeRef {
  const { runInContext } = setupContext(options?.injector, windowSize);
  const initialValue = options?.initialValue ?? DEFAULT_VALUE;

  return runInContext(({ isServer }) => {
    if (isServer) {
      return {
        width: constSignal(initialValue.width),
        height: constSignal(initialValue.height),
      };
    }

    const includeScrollbar = options?.includeScrollbar ?? false;

    const width = signal(initialValue.width);
    const height = signal(initialValue.height);

    const update = () => {
      width.set(includeScrollbar ? window.innerWidth : document.documentElement.clientWidth);
      height.set(includeScrollbar ? window.innerHeight : document.documentElement.clientHeight);
    };

    listener(window, 'resize', update);

    watcher(mediaQuery('(orientation: portrait)'), update);

    afterNextRender({ read: update });

    return {
      width: width.asReadonly(),
      height: height.asReadonly(),
    };
  });
}

export const WINDOW_SIZE = /* @__PURE__ */ createToken(windowSize);

const DEFAULT_VALUE: WindowSizeValue = {
  width: 0,
  height: 0,
};

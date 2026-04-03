import { signal, type Signal, untracked } from '@angular/core';
import { constSignal, NOOP_ASYNC_FN, setupContext } from '@signality/core/internal';
import { toElement } from '@signality/core/utilities';
import type { MaybeElementSignal, WithInjector } from '@signality/core/types';
import { listener, setupSync } from '@signality/core/browser/listener';

export interface FullscreenOptions extends WithInjector {
  /**
   * Element to make fullscreen.
   * @default document.documentElement
   */
  readonly target?: MaybeElementSignal<Element>;
}

export interface FullscreenRef {
  /**
   * Whether the Fullscreen API is supported in the current browser.
   *
   * @see [Fullscreen API browser compatibility on MDN](https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API#browser_compatibility)
   */
  readonly isSupported: Signal<boolean>;

  /**
   * Whether the target element is currently displayed in fullscreen mode.
   *
   * @see [Document: fullscreenElement on MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document/fullscreenElement)
   */
  readonly isActive: Signal<boolean>;

  /**
   * Enter fullscreen mode for the target element.
   *
   * @see [Element: requestFullscreen() on MDN](https://developer.mozilla.org/en-US/docs/Web/API/Element/requestFullscreen)
   */
  readonly enter: () => Promise<void>;

  /**
   * Exit fullscreen mode.
   *
   * @see [Document: exitFullscreen() on MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document/exitFullscreen)
   */
  readonly exit: () => Promise<void>;

  /**
   * Toggle fullscreen mode — enters if inactive, exits if active.
   */
  readonly toggle: () => Promise<void>;
}

/**
 * Signal-based wrapper around the [Fullscreen API](https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API).
 *
 * @param options - Optional configuration including target element and injector
 * @returns A {@link FullscreenRef} with `isSupported`, `isActive` signals and `enter`/`exit`/`toggle` methods
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     @if (fs.isSupported()) {
 *       <button (click)="fs.toggle()">Toggle Fullscreen</button>
 *       <p>Active: {{ fs.isActive() }}</p>
 *     }
 *   `
 * })
 * export class FullscreenDemo {
 *   readonly fs = fullscreen();
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Fullscreen a specific element
 * @Component({
 *   template: `
 *     <div #container>
 *       <p>This content can go fullscreen</p>
 *       <button (click)="fs.toggle()">Toggle</button>
 *     </div>
 *   `
 * })
 * export class ElementFullscreen {
 *   readonly container = viewChild<ElementRef>('container');
 *   readonly fs = fullscreen({ target: this.container });
 * }
 * ```
 */
export function fullscreen(options?: FullscreenOptions): FullscreenRef {
  const { runInContext } = setupContext(options?.injector, fullscreen);

  return runInContext(({ isBrowser }) => {
    const isSupported = constSignal(
      isBrowser && 'fullscreenEnabled' in document && document.fullscreenEnabled
    );

    if (!isSupported()) {
      return {
        isSupported,
        isActive: constSignal(false),
        enter: NOOP_ASYNC_FN,
        exit: NOOP_ASYNC_FN,
        toggle: NOOP_ASYNC_FN,
      };
    }

    const target = options?.target ?? document.documentElement;

    const isActive = signal(false);

    const enter = async (): Promise<void> => {
      const el = toElement.untracked(target);

      if (el && document.fullscreenElement !== el) {
        try {
          await el.requestFullscreen();
        } catch (error) {
          if (ngDevMode) {
            console.warn(`[fullscreen] Failed to enter fullscreen mode.`, error);
          }
        }
      }
    };

    const exit = async (): Promise<void> => {
      const el = toElement.untracked(target);

      if (el && document.fullscreenElement === el) {
        try {
          await document.exitFullscreen();
        } catch (error) {
          if (ngDevMode) {
            console.warn(`[fullscreen] Failed to exit fullscreen mode.`, error);
          }
        }
      }
    };

    const toggle = async (): Promise<void> => {
      if (untracked(isActive)) {
        await exit();
      } else {
        await enter();
      }
    };

    setupSync(() => {
      listener(document, 'fullscreenchange', () => {
        const el = toElement.untracked(target);
        isActive.set(document.fullscreenElement != null && document.fullscreenElement === el);
      });
    });

    return {
      isSupported,
      isActive: isActive.asReadonly(),
      enter,
      exit,
      toggle,
    };
  });
}

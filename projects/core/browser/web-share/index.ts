import { type Signal, signal, untracked } from '@angular/core';
import { constSignal, NOOP_ASYNC_FN, setupContext } from '@signality/core/internal';
import type { WithInjector } from '@signality/core/types';

export interface WebShareRef {
  /**
   * Whether the Web Share API is supported in the current browser.
   *
   * @see [Web Share API browser compatibility on MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API#browser_compatibility)
   */
  readonly isSupported: Signal<boolean>;

  /**
   * Whether the native share dialog is currently open.
   */
  readonly isSharing: Signal<boolean>;

  /**
   * Open the native share dialog with the provided data.
   *
   * @see [Navigator: share() on MDN](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share)
   */
  readonly share: (data: ShareData) => Promise<void>;

  /**
   * Check whether the given data can be shared via the Web Share API.
   *
   * @see [Navigator: canShare() on MDN](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/canShare)
   */
  readonly canShare: (data?: ShareData) => boolean;
}

/**
 * Signal-based wrapper around the [Web Share API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API).
 *
 * @param options - Optional injector for DI context
 * @returns A WebShareRef with share methods and state signals
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     @if (webShare.isSupported()) {
 *       <button (click)="shareContent()" [disabled]="webShare.isSharing()">
 *         Share This Page
 *       </button>
 *     }
 *   `
 * })
 * class WebShareDemo {
 *   readonly webShare = webShare();
 *
 *   async shareContent() {
 *     await this.webShare.share({
 *       title: 'Check this out!',
 *       url: window.location.href,
 *     });
 *   }
 * }
 * ```
 */
export function webShare(options?: WithInjector): WebShareRef {
  const { runInContext } = setupContext(options?.injector, webShare);

  return runInContext(({ isBrowser }) => {
    const isSupported = constSignal(isBrowser && 'share' in navigator);

    if (!isSupported()) {
      return {
        isSupported,
        isSharing: constSignal(false),
        canShare: () => false,
        share: NOOP_ASYNC_FN,
      };
    }

    const isSharing = signal(false);

    const share = async (data: ShareData): Promise<void> => {
      if (untracked(isSharing)) {
        return;
      }

      try {
        isSharing.set(true);
        await navigator.share(data);
      } catch (error) {
        // user canceled, or share failed
        // AbortError is expected when a user cancels
        if ((error as Error).name !== 'AbortError') {
          if (ngDevMode) {
            console.warn(`[webShare] Failed to share content.`, error);
          }
        }
      } finally {
        isSharing.set(false);
      }
    };

    const canShare = (data?: ShareData): boolean => {
      try {
        return navigator.canShare(data);
      } catch (error) {
        if (ngDevMode) {
          console.warn(`[webShare] Failed to check if content can be shared.`, error);
        }
        return false;
      }
    };

    return {
      isSupported,
      isSharing: isSharing.asReadonly(),
      canShare,
      share,
    };
  });
}

import { signal, type Signal, untracked } from '@angular/core';
import {
  constSignal,
  getPipElement,
  NOOP_ASYNC_FN,
  setupContext,
  toElement,
} from '@signality/core/internal';
import type { MaybeElementSignal, WithInjector } from '@signality/core/types';
import { listener } from '@signality/core/browser/listener';
import { onDisconnect } from '@signality/core/elements/on-disconnect';

export type PictureInPictureOptions = WithInjector;

export interface PictureInPictureRef {
  /**
   * Whether the Picture-in-Picture API is supported in the current browser.
   *
   * @see [Picture-in-Picture API browser compatibility on MDN](https://developer.mozilla.org/en-US/docs/Web/API/Picture-in-Picture_API#browser_compatibility)
   */
  readonly isSupported: Signal<boolean>;

  /**
   * Whether the target video element is currently displayed in Picture-in-Picture mode.
   *
   * @see [Document: pictureInPictureElement on MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document/pictureInPictureElement)
   */
  readonly isActive: Signal<boolean>;

  /**
   * Enter Picture-in-Picture mode for the target video element.
   *
   * @see [HTMLVideoElement: requestPictureInPicture() on MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement/requestPictureInPicture)
   */
  readonly enter: () => Promise<void>;

  /**
   * Exit Picture-in-Picture mode.
   *
   * @see [Document: exitPictureInPicture() on MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document/exitPictureInPicture)
   */
  readonly exit: () => Promise<void>;

  /**
   * Toggle Picture-in-Picture mode — enters if inactive, exits if active.
   */
  readonly toggle: () => Promise<void>;
}

/**
 * Signal-based wrapper around the [Picture-in-Picture API](https://developer.mozilla.org/en-US/docs/Web/API/Picture-in-Picture_API).
 *
 * Automatically exits Picture-in-Picture when the target element is disconnected from the DOM.
 *
 * @param target - Video element
 * @param options - Optional configuration
 * @returns A {@link PictureInPictureRef} with `isSupported`, `isActive` signals and `enter`/`exit`/`toggle` methods
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     @if (pip.isSupported()) {
 *       <video #video src="video.mp4"></video>
 *       <button (click)="pip.toggle()">Toggle PiP</button>
 *       <p>Active: {{ pip.isActive() }}</p>
 *     }
 *   `
 * })
 * class PiPDemo {
 *   readonly video = viewChild<HTMLVideoElement>('video');
 *   readonly pip = pictureInPicture(this.video);
 * }
 * ```
 */
export function pictureInPicture(
  target: MaybeElementSignal<HTMLVideoElement>,
  options?: PictureInPictureOptions
): PictureInPictureRef {
  const { runInContext } = setupContext(options?.injector, pictureInPicture);

  return runInContext(({ isBrowser }) => {
    const isSupported = constSignal(
      isBrowser &&
        'pictureInPictureEnabled' in document &&
        document.pictureInPictureEnabled !== false
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

    const isActive = signal(false);

    const enter = async (): Promise<void> => {
      const targetEl = toElement.untracked(target);
      await targetEl?.requestPictureInPicture();
    };

    const exit = async (): Promise<void> => {
      const targetEl = toElement.untracked(target);
      const pipEl = getPipElement(document);

      if (targetEl && pipEl && targetEl === pipEl) {
        await document.exitPictureInPicture();
      }
    };

    const toggle = async (): Promise<void> => {
      if (untracked(isActive)) {
        await exit();
      } else {
        await enter();
      }
    };

    listener(target, 'enterpictureinpicture', () => isActive.set(true));
    listener(target, 'leavepictureinpicture', () => isActive.set(false));

    onDisconnect(target, async targetEl => {
      const pipEl = getPipElement(document);

      if (pipEl && targetEl === pipEl) {
        await document.exitPictureInPicture();
        isActive.set(false);
      }
    });

    return {
      isSupported,
      isActive,
      enter,
      exit,
      toggle,
    };
  });
}

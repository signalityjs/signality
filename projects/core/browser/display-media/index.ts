import { computed, DestroyRef, inject, type Signal, signal, untracked } from '@angular/core';
import { constSignal, NOOP_FN, setupContext } from '@signality/core/internal';
import type { WithInjector } from '@signality/core/types';
import { listener } from '@signality/core/browser/listener';

export interface DisplayMediaOptions extends WithInjector {
  /**
   * Video track constraints for the captured stream.
   *
   * @default true
   * @see [MediaTrackConstraints on MDN](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints)
   */
  readonly video?: boolean | MediaTrackConstraints;

  /**
   * Audio track constraints for the captured stream.
   *
   * @default false
   * @see [MediaTrackConstraints on MDN](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints)
   */
  readonly audio?: boolean | MediaTrackConstraints;
}

export interface DisplayMediaRef {
  /**
   * Whether the Screen Capture API is supported in the current browser.
   *
   * @see [Screen Capture API browser compatibility on MDN](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Capture_API#browser_compatibility)
   */
  readonly isSupported: Signal<boolean>;

  /**
   * Whether screen capture is currently active.
   */
  readonly isActive: Signal<boolean>;

  /**
   * The active media stream, or `null` if capture is not active.
   *
   * @see [MediaStream on MDN](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream)
   */
  readonly stream: Signal<MediaStream | null>;

  /**
   * The last error that occurred, or `null` if no error.
   */
  readonly error: Signal<Error | null>;

  /**
   * Start screen capture. Opens the browser's display picker.
   *
   * @see [MediaDevices: getDisplayMedia() on MDN](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia)
   */
  readonly start: () => Promise<MediaStream | null>;

  /**
   * Stop all active capture tracks and clear the stream.
   *
   * @see [MediaStreamTrack: stop() on MDN](https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack/stop)
   */
  readonly stop: () => void;
}

/**
 * Signal-based wrapper around the [Screen Capture API](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Capture_API).
 * Capture screen content with Angular signals.
 *
 * @param options - Optional default configuration
 * @returns A DisplayMediaRef with isSupported, stream, error signals and control methods
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     @if (screen.isSupported()) {
 *       <button (click)="toggleCapture()">
 *         {{ screen.isActive() ? 'Stop' : 'Start' }} Screen Capture
 *       </button>
 *       @if (screen.stream(); as stream) {
 *         <video [srcObject]="stream" autoplay></video>
 *       }
 *       @if (screen.error(); as error) {
 *         <p class="error">{{ error.message }}</p>
 *       }
 *     } @else {
 *       <p>Screen Capture API not supported</p>
 *     }
 *   `
 * })
 * export class ScreenCaptureDemo {
 *   readonly screen = displayMedia();
 *
 *   async toggleCapture() {
 *     if (this.screen.isActive()) {
 *       this.screen.stop();
 *     } else {
 *       await this.screen.start();
 *     }
 *   }
 * }
 * ```
 */
export function displayMedia(options?: DisplayMediaOptions): DisplayMediaRef {
  const { runInContext } = setupContext(options?.injector, displayMedia);

  return runInContext(({ isBrowser, injector, onCleanup }) => {
    const destroyRef = inject(DestroyRef);

    const isSupported = constSignal(
      isBrowser &&
        'mediaDevices' in navigator &&
        typeof navigator.mediaDevices?.getDisplayMedia === 'function'
    );

    if (!isSupported()) {
      return {
        isSupported,
        isActive: constSignal(false),
        stream: constSignal(null),
        error: constSignal(null),
        start: () => Promise.resolve(null),
        stop: NOOP_FN,
      };
    }

    const constraints: DisplayMediaStreamOptions = {
      video: options?.video ?? true,
      audio: options?.audio ?? false,
    };

    const stream = signal<MediaStream | null>(null);
    const error = signal<Error | null>(null);
    const isActive = computed(() => stream() !== null);

    const start = async (): Promise<MediaStream | null> => {
      try {
        stop();

        const mediaStream = await navigator.mediaDevices.getDisplayMedia(constraints);

        if (destroyRef.destroyed) {
          mediaStream.getTracks().forEach(track => track.stop());
          return null;
        }

        stream.set(mediaStream);
        error.set(null);

        mediaStream
          .getTracks()
          .forEach(track => listener(track, 'ended', () => stop(), { injector }));

        return mediaStream;
      } catch (err) {
        if (destroyRef.destroyed) {
          return null;
        }
        error.set(err as DOMException | TypeError);
        return null;
      }
    };

    const stop = () => {
      const currStream = untracked(stream);
      if (currStream) {
        currStream.getTracks().forEach(track => track.stop());
        stream.set(null);
      }
      error.set(null);
    };

    onCleanup(stop);

    return {
      isSupported,
      isActive: isActive,
      stream: stream.asReadonly(),
      error: error.asReadonly(),
      start,
      stop,
    };
  });
}

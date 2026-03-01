import { computed, type Signal, signal } from '@angular/core';
import { constSignal, NOOP_FN, setupContext } from '@signality/core/internal';
import type { WithInjector } from '@signality/core/types';

export interface DisplayMediaOptions extends WithInjector {
  /**
   * Video constraints.
   * @default true
   */
  readonly video?: boolean | MediaTrackConstraints;

  /**
   * Audio constraints.
   * @default false
   */
  readonly audio?: boolean | MediaTrackConstraints;
}

export interface DisplayMediaRef {
  /** Whether Screen Capture API is supported */
  readonly isSupported: Signal<boolean>;

  /** Whether currently capturing */
  readonly isActive: Signal<boolean>;

  /** Current media stream */
  readonly stream: Signal<MediaStream | null>;

  /** Last error */
  readonly error: Signal<Error | null>;

  /** Start screen capture */
  readonly start: (options?: DisplayMediaOptions) => Promise<MediaStream | undefined>;

  /** Stop screen capture */
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
 * class ScreenCaptureComponent {
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
 *
 * @example
 * ```typescript
 * // With custom constraints
 * const screen = displayMedia({
 *   video: {
 *     width: { ideal: 1920 },
 *     height: { ideal: 1080 },
 *   },
 *   audio: true,
 * });
 * ```
 */
export function displayMedia(options?: DisplayMediaOptions): DisplayMediaRef {
  const { runInContext } = setupContext(options?.injector, displayMedia);

  return runInContext(({ onCleanup, isBrowser }) => {
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
        start: () => Promise.resolve(undefined),
        stop: NOOP_FN,
      };
    }

    const stream = signal<MediaStream | null>(null);
    const error = signal<Error | null>(null);
    const isActive = computed(() => stream() !== null);

    const defaultOptions: DisplayMediaOptions = {
      video: options?.video ?? true,
      audio: options?.audio ?? false,
    };

    const start = async (startOptions?: DisplayMediaOptions): Promise<MediaStream | undefined> => {
      try {
        // Stop existing stream
        stop();

        const opts = { ...defaultOptions, ...startOptions };

        const mediaStream = await navigator.mediaDevices.getDisplayMedia({
          video: opts.video,
          audio: opts.audio,
        });

        stream.set(mediaStream);
        error.set(null);

        // Stop stream when any track ends (user stops sharing)
        const tracks = mediaStream.getTracks();
        for (const track of tracks) {
          track.addEventListener('ended', () => {
            stop();
          });
        }

        return mediaStream;
      } catch (err) {
        let errorObj: Error;

        if (err instanceof Error) {
          if (err.name === 'NotAllowedError') {
            errorObj = new Error('Screen capture permission denied');
          } else if (err.name === 'AbortError') {
            errorObj = new Error('Screen capture cancelled by user');
          } else if (err.name === 'NotFoundError') {
            errorObj = new Error('No screen capture source available');
          } else if (err.name === 'NotReadableError') {
            errorObj = new Error('Screen capture source is not readable');
          } else {
            errorObj = err;
          }
        } else {
          errorObj = new Error('Failed to start screen capture');
        }

        error.set(errorObj);

        if (ngDevMode) {
          console.warn('[displayMedia]', errorObj.message);
        }

        return undefined;
      }
    };

    const stop = () => {
      const currentStream = stream();
      if (currentStream) {
        const tracks = currentStream.getTracks();
        for (const track of tracks) {
          track.stop();
        }
        stream.set(null);
      }
      error.set(null);
    };

    onCleanup(() => {
      stop();
    });

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

import { computed, type Signal, signal, untracked } from '@angular/core';
import { constSignal, NOOP_FN, setupContext } from '@signality/core/internal';
import type { WithInjector } from '@signality/core/types';

export interface GeolocationOptions extends WithInjector {
  /**
   * Start tracking immediately.
   * @default true
   */
  readonly immediate?: boolean;

  /**
   * Use GPS for better accuracy.
   * @default true
   */
  readonly enableHighAccuracy?: boolean;

  /**
   * Max age of cached position (ms).
   * @default 0
   */
  readonly maximumAge?: number;

  /**
   * Request timeout (ms).
   * @default Infinity
   */
  readonly timeout?: number;
}

export interface GeolocationRef {
  /** Whether Geolocation is supported */
  readonly isSupported: Signal<boolean>;

  /** Full position object with timestamp */
  readonly position: Signal<GeolocationPosition | null>;

  /** Last error */
  readonly error: Signal<GeolocationPositionError | null>;

  /** Whether location tracking is currently active */
  readonly isActive: Signal<boolean>;

  /** Whether currently fetching location */
  readonly isLoading: Signal<boolean>;

  /** Start/resume watching position */
  readonly start: () => void;

  /** Stop watching position */
  readonly stop: () => void;
}

/**
 * Signal-based wrapper around the [Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API).
 *
 * @param options - Configuration options
 * @returns A GeolocationRef with location signals and control methods
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     @if (geo.isLoading()) {
 *       <p>Getting your location...</p>
 *     } @else if (geo.position()?.coords; as coords) {
 *       <p>{{ coords.latitude }}, {{ coords.longitude }}</p>
 *     }
 *     <button (click)="geo.stop()">Stop</button>
 *     <button (click)="geo.start()">Start</button>
 * })
 * class LocationComponent {
 *   readonly geo = geolocation();
 * }
 * ```
 */
export function geolocation(options?: GeolocationOptions): GeolocationRef {
  const { runInContext } = setupContext(options?.injector, geolocation);

  return runInContext(({ isBrowser, onCleanup }) => {
    const isSupported = constSignal(isBrowser && 'geolocation' in navigator);

    if (!isSupported()) {
      return {
        isSupported,
        position: constSignal(null),
        error: constSignal(null),
        isLoading: constSignal(false),
        isActive: constSignal(false),
        start: NOOP_FN,
        stop: NOOP_FN,
      };
    }

    const immediate = options?.immediate ?? true;

    const positionOptions: PositionOptions = {
      enableHighAccuracy: options?.enableHighAccuracy ?? true,
      maximumAge: options?.maximumAge ?? 0,
      timeout: options?.timeout ?? Infinity,
    };

    const position = signal<GeolocationPosition | null>(null);
    const error = signal<GeolocationPositionError | null>(null);
    const isLoading = signal(false);
    const watchId = signal<number | undefined>(undefined);

    const handleSuccess = (pos: GeolocationPosition) => {
      position.set(pos);
      error.set(null);
      isLoading.set(false);
    };

    const handleError = (err: GeolocationPositionError) => {
      error.set(err);
      isLoading.set(false);
    };

    const start = () => {
      untracked(() => {
        if (watchId() !== undefined) {
          return;
        }

        isLoading.set(true);
        const id = navigator.geolocation.watchPosition(handleSuccess, handleError, positionOptions);
        watchId.set(id);
      });
    };

    const stop = () => {
      untracked(() => {
        const currentId = watchId();

        if (currentId !== undefined) {
          navigator.geolocation.clearWatch(currentId);
          watchId.set(undefined);
        }

        isLoading.set(false);
      });
    };

    const abortController = new AbortController();

    onCleanup(() => {
      abortController.abort();
      stop();
    });

    navigator.permissions.query({ name: 'geolocation' }).then(status => {
      if (abortController.signal.aborted) {
        return;
      }

      const check = () => {
        if (status.state === 'denied') {
          stop();
        }
      };

      check();

      status.addEventListener('change', check, {
        signal: abortController.signal,
      });
    });

    if (immediate) {
      start();
    }

    return {
      isSupported,
      position: position.asReadonly(),
      error: error.asReadonly(),
      isLoading: isLoading.asReadonly(),
      isActive: computed(() => watchId() !== undefined),
      start,
      stop,
    };
  });
}

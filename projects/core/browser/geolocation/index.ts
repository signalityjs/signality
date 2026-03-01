import { type Signal, signal } from '@angular/core';
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
  /** Current coordinates */
  readonly coords: Signal<GeolocationCoordinates | null>;

  /** Full position object with timestamp */
  readonly position: Signal<GeolocationPosition | null>;

  /** Last error */
  readonly error: Signal<GeolocationPositionError | null>;

  /** Whether Geolocation is supported */
  readonly isSupported: Signal<boolean>;

  /** Whether currently fetching location */
  readonly isLoading: Signal<boolean>;

  /** Stop watching position */
  readonly pause: () => void;

  /** Start/resume watching position */
  readonly resume: () => void;
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
 *     } @else if (geo.coords(); as coords) {
 *       <p>{{ coords.latitude }}, {{ coords.longitude }}</p>
 *     }
 *   `
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
        coords: constSignal(null),
        position: constSignal(null),
        error: constSignal(null),
        isLoading: constSignal(false),
        pause: NOOP_FN,
        resume: NOOP_FN,
      };
    }

    const immediate = options?.immediate ?? true;
    const enableHighAccuracy = options?.enableHighAccuracy ?? true;
    const maximumAge = options?.maximumAge ?? 0;
    const timeout = options?.timeout ?? Infinity;

    const coords = signal<GeolocationCoordinates | null>(null);
    const position = signal<GeolocationPosition | null>(null);
    const error = signal<GeolocationPositionError | null>(null);
    const isLoading = signal(false);

    let watchId: number | undefined;

    const onSuccess = (pos: GeolocationPosition) => {
      position.set(pos);
      coords.set(pos.coords);
      error.set(null);
      isLoading.set(false);
    };

    const onError = (err: GeolocationPositionError) => {
      error.set(err);
      isLoading.set(false);
    };

    const resume = () => {
      if (watchId !== undefined) return;

      isLoading.set(true);

      watchId = navigator.geolocation.watchPosition(onSuccess, onError, {
        enableHighAccuracy,
        maximumAge,
        timeout,
      });
    };

    const pause = () => {
      if (watchId === undefined) return;

      navigator.geolocation.clearWatch(watchId);
      watchId = undefined;

      isLoading.set(false);
    };

    if (immediate) {
      resume();
    }

    onCleanup(pause);

    return {
      isSupported,
      coords: coords.asReadonly(),
      position: position.asReadonly(),
      error: error.asReadonly(),
      isLoading: isLoading.asReadonly(),
      pause,
      resume,
    };
  });
}

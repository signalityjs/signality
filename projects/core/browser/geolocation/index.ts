import { computed, type Signal, signal, untracked } from '@angular/core';
import { constSignal, NOOP_FN, setupContext } from '@signality/core/internal';
import type { WithInjector } from '@signality/core/types';

export interface GeolocationOptions extends WithInjector {
  /**
   * Start tracking immediately on initialization.
   *
   * @default true
   */
  readonly immediate?: boolean;

  /**
   * Use GPS for higher accuracy. May be slower and consume more power.
   *
   * @default true
   * @see [PositionOptions: enableHighAccuracy on MDN](https://developer.mozilla.org/en-US/docs/Web/API/PositionOptions/enableHighAccuracy)
   */
  readonly enableHighAccuracy?: boolean;

  /**
   * Maximum age of a cached position in milliseconds. `0` forces a fresh lookup.
   *
   * @default 0
   * @see [PositionOptions: maximumAge on MDN](https://developer.mozilla.org/en-US/docs/Web/API/PositionOptions/maximumAge)
   */
  readonly maximumAge?: number;

  /**
   * Maximum time in milliseconds allowed to retrieve a position before erroring.
   *
   * @default Infinity
   * @see [PositionOptions: timeout on MDN](https://developer.mozilla.org/en-US/docs/Web/API/PositionOptions/timeout)
   */
  readonly timeout?: number;
}

export interface GeolocationRef {
  /**
   * Whether the Geolocation API is supported in the current browser.
   *
   * @see [Geolocation API browser compatibility on MDN](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API#browser_compatibility)
   */
  readonly isSupported: Signal<boolean>;

  /**
   * The most recent position, including coordinates and timestamp. `null` until first fix.
   *
   * @see [GeolocationPosition on MDN](https://developer.mozilla.org/en-US/docs/Web/API/GeolocationPosition)
   */
  readonly position: Signal<GeolocationPosition | null>;

  /**
   * The last error returned by the Geolocation API, or `null` if no error.
   *
   * @see [GeolocationPositionError on MDN](https://developer.mozilla.org/en-US/docs/Web/API/GeolocationPositionError)
   */
  readonly error: Signal<GeolocationPositionError | null>;

  /**
   * Whether position watching is currently active.
   */
  readonly isActive: Signal<boolean>;

  /**
   * Whether a position fix is currently being fetched.
   */
  readonly isLoading: Signal<boolean>;

  /**
   * Start watching the device position.
   *
   * @see [Geolocation: watchPosition() on MDN](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/watchPosition)
   */
  readonly start: () => void;

  /**
   * Stop watching the device position.
   *
   * @see [Geolocation: clearWatch() on MDN](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/clearWatch)
   */
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
 * class LocationDemo {
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

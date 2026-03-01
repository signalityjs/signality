import { type Signal, signal } from '@angular/core';
import { constSignal, NOOP_FN, setupContext, type Timer, toValue } from '@signality/core/internal';
import type { MaybeSignal, WithInjector } from '@signality/core/types';

export type VibrateOptions = WithInjector;

export interface VibrateRef {
  /** Whether Vibration API is supported */
  readonly isSupported: Signal<boolean>;

  /** Whether currently vibrating */
  readonly isVibrating: Signal<boolean>;

  /** Start vibration */
  readonly vibrate: (pattern?: number | number[]) => void;

  /** Stop vibration */
  readonly stop: () => void;
}

/**
 * Signal-based wrapper around the Vibration API.
 *
 * @param pattern - Default vibration pattern in milliseconds
 * @param options - Optional injector for DI context
 * @returns A VibrateRef with vibration control methods
 *
 * @example
 * ```typescript
 * const vib = vibrate();
 *
 * vib.vibrate(100); // Vibrate for 100ms
 * vib.vibrate([100, 50, 100]); // Pattern: vibrate, pause, vibrate
 * ```
 */
export function vibrate(
  pattern?: MaybeSignal<number | number[]>,
  options?: VibrateOptions
): VibrateRef {
  const { runInContext } = setupContext(options?.injector, vibrate);

  return runInContext(({ isBrowser, onCleanup }) => {
    const isSupported = constSignal(isBrowser && 'vibrate' in navigator);

    if (!isSupported()) {
      return {
        isSupported,
        isVibrating: constSignal(false),
        vibrate: NOOP_FN,
        stop: NOOP_FN,
      };
    }

    const isVibrating = signal(false);

    let vibrateTimeout: Timer;

    const vibrateDevice = (vibratePattern?: number | number[]) => {
      const resolvedPattern = vibratePattern ?? toValue.untracked(pattern) ?? 200;

      try {
        const result = navigator.vibrate(resolvedPattern);

        isVibrating.set(result);

        const duration = Array.isArray(resolvedPattern)
          ? resolvedPattern.reduce((a, b) => a + b, 0)
          : resolvedPattern;

        if (result && duration > 0) {
          if (vibrateTimeout) {
            clearTimeout(vibrateTimeout);
          }

          vibrateTimeout = setTimeout(() => {
            isVibrating.set(false);
            vibrateTimeout = undefined;
          }, duration);
        }
      } catch (error) {
        isVibrating.set(false);
        if (ngDevMode) {
          console.warn(`[vibrate] Failed to vibrate device.`, error);
        }
      }
    };

    const stop = () => {
      try {
        navigator.vibrate(0);
        isVibrating.set(false);
      } catch (error) {
        if (ngDevMode) {
          console.warn(`[vibrate] Failed to stop vibration.`, error);
        }
      }

      if (vibrateTimeout) {
        clearTimeout(vibrateTimeout);
        vibrateTimeout = undefined;
      }
    };

    onCleanup(() => {
      if (vibrateTimeout) {
        clearTimeout(vibrateTimeout);
      }
    });

    return {
      isSupported,
      isVibrating: isVibrating.asReadonly(),
      vibrate: vibrateDevice,
      stop,
    };
  });
}

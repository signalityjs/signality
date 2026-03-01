import { computed, signal, type Signal } from '@angular/core';
import { constSignal, setupContext } from '@signality/core/internal';
import type { WithInjector } from '@signality/core/types';
import { listener, setupSync } from '@signality/core/browser/listener';

export interface GamepadRef {
  /** Array of connected gamepads */
  readonly gamepads: Signal<(Gamepad | null)[]>;

  /** Whether Gamepad API is supported */
  readonly isSupported: Signal<boolean>;

  /** First connected gamepad */
  readonly activeGamepad: Signal<Gamepad | undefined>;

  /** Axes values of active gamepad */
  readonly axes: Signal<readonly number[]>;

  /** Button states of active gamepad */
  readonly buttons: Signal<readonly GamepadButton[]>;
}

/**
 * Signal-based wrapper around the Gamepad API.
 *
 * @param options - Optional injector for DI context
 * @returns A GamepadRef with gamepad state signals
 *
 * @example
 * ```typescript
 * const gp = gamepad();
 *
 * // In template: @for (pad of gp.gamepads(); track pad?.index) { ... }
 * ```
 */
export function gamepad(options?: WithInjector): GamepadRef {
  const { runInContext } = setupContext(options?.injector, gamepad);

  return runInContext(({ onCleanup, isBrowser }) => {
    const isSupported = constSignal(isBrowser && 'getGamepads' in navigator);

    if (!isSupported()) {
      return {
        isSupported,
        gamepads: constSignal([]),
        activeGamepad: constSignal(undefined),
        axes: constSignal([]),
        buttons: constSignal([]),
      };
    }

    const getGamepads = () => {
      try {
        const pads = navigator.getGamepads();
        return [...pads];
      } catch (error) {
        if (ngDevMode) {
          console.warn(`[gamepad] Failed to get gamepads.`, error);
        }
        return [];
      }
    };

    const gamepads = signal<(Gamepad | null)[]>(getGamepads());
    const activeGamepad = computed(() => gamepads().find(gp => gp !== null) ?? undefined);
    const axes = computed(() => activeGamepad()?.axes ?? []);
    const buttons = computed(() => activeGamepad()?.buttons ?? []);

    let animationFrameId: number | null = null;

    const pollGamepads = () => {
      gamepads.set(getGamepads());
      animationFrameId = requestAnimationFrame(pollGamepads);
    };

    const onGamepadConnected = () => {
      gamepads.set(getGamepads());

      if (animationFrameId === null) {
        pollGamepads();
      }
    };

    const onGamepadDisconnected = () => {
      gamepads.set(getGamepads());

      const hasGamepads = gamepads().some(gp => gp !== null);

      if (!hasGamepads && animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    };

    setupSync(() => {
      listener.passive(window, 'gamepadconnected', onGamepadConnected);
      listener.passive(window, 'gamepaddisconnected', onGamepadDisconnected);
    });

    if (gamepads().some(gp => gp !== null)) {
      pollGamepads();
    }

    onCleanup(() => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
    });

    return {
      isSupported,
      gamepads: gamepads.asReadonly(),
      activeGamepad,
      axes,
      buttons,
    };
  });
}

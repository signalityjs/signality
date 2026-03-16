import { computed, signal, type Signal } from '@angular/core';
import { constSignal, setupContext } from '@signality/core/internal';
import type { WithInjector } from '@signality/core/types';
import { listener, setupSync } from '@signality/core/browser/listener';

export interface GamepadRef {
  /**
   * Whether the Gamepad API is supported in the current browser.
   *
   * @see [Gamepad API browser compatibility on MDN](https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API#browser_compatibility)
   */
  readonly isSupported: Signal<boolean>;

  /**
   * Array of all connected gamepads. Indices match the gamepad's `index` property. May contain `null` for disconnected slots.
   *
   * @see [Navigator: getGamepads() on MDN](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/getGamepads)
   */
  readonly gamepads: Signal<(Gamepad | null)[]>;

  /**
   * The first connected gamepad, or `undefined` if none are connected.
   *
   * @see [Gamepad on MDN](https://developer.mozilla.org/en-US/docs/Web/API/Gamepad)
   */
  readonly activeGamepad: Signal<Gamepad | undefined>;

  /**
   * Axes values of the active gamepad. Each value is in the range `[-1, 1]`.
   *
   * @see [Gamepad: axes on MDN](https://developer.mozilla.org/en-US/docs/Web/API/Gamepad/axes)
   */
  readonly axes: Signal<readonly number[]>;

  /**
   * Button states of the active gamepad.
   *
   * @see [Gamepad: buttons on MDN](https://developer.mozilla.org/en-US/docs/Web/API/Gamepad/buttons)
   */
  readonly buttons: Signal<readonly GamepadButton[]>;
}

/**
 * Signal-based wrapper around the [Gamepad API](https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API).
 *
 * @param options - Optional injector for DI context
 * @returns A GamepadRef with gamepad state signals
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     @if (gp.isSupported()) {
 *       @for (pad of gp.gamepads(); track pad?.index) {
 *         <p>{{ pad?.id }}</p>
 *       }
 *       <p>Axes: {{ gp.axes() }}</p>
 *     }
 *   `
 * })
 * class GamepadDemo {
 *   readonly gp = gamepad();
 * }
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

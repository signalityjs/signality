import { signal, type Signal } from '@angular/core';
import { constSignal, createToken, setupContext } from '@signality/core/internal';
import type { WithInjector } from '@signality/core/types';
import { listener, setupSync } from '@signality/core/browser/listener';

export type InputModality = 'keyboard' | 'mouse' | 'touch' | null;

const TOUCH_BUFFER_MS = 650;

const MODIFIER_KEYS = ['Shift', 'Control', 'Alt', 'Meta', 'ContextMenu'];

/**
 * Reactively track the user's current input method (keyboard, mouse, or touch).
 *
 * @param options - Optional configuration including injector
 * @returns A signal containing the current input modality: `'keyboard'`, `'mouse'`, `'touch'`, or `null`
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     <div [class.keyboard]="modality() === 'keyboard'">
 *       <p>Current input: {{ modality() ?? 'none' }}</p>
 *       <button>Button with conditional focus ring</button>
 *     </div>
 *   `
 * })
 * export class ModalityDemo {
 *   readonly modality = inputModality();
 * }
 * ```
 */
export function inputModality(options?: WithInjector): Signal<InputModality> {
  const { runInContext } = setupContext(options?.injector, inputModality);

  return runInContext(({ isServer }) => {
    if (isServer) {
      return constSignal(null);
    }

    const modality = signal<InputModality>(null);

    let lastTouchMs = 0;

    setupSync(() => {
      listener(document, 'keydown', (event: KeyboardEvent) => {
        if (MODIFIER_KEYS.includes(event.key)) {
          return;
        }
        modality.set('keyboard');
      });

      listener(document, 'mousedown', () => {
        if (Date.now() - lastTouchMs < TOUCH_BUFFER_MS) {
          return;
        }
        modality.set('mouse');
      });

      listener.passive(document, 'touchstart', () => {
        lastTouchMs = Date.now();
        modality.set('touch');
      });
    });

    return modality.asReadonly();
  });
}

export const INPUT_MODALITY = /* @__PURE__ */ createToken(inputModality);

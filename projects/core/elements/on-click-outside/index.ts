import { NOOP_EFFECT_REF, setupContext, toElement } from '@signality/core/internal';
import type { MaybeElementSignal, WithInjector } from '@signality/core/types';
import { listener, setupSync } from '@signality/core/browser/listener';

export interface OnClickOutsideOptions extends WithInjector {
  /**
   * Elements that should not trigger the outside click handler.
   */
  readonly ignore?: MaybeElementSignal<Element>[];
}

export interface OnClickOutsideRef {
  /** Stops listening for outside clicks. */
  readonly destroy: () => void;
}

/**
 * Detects clicks outside a target element and invokes a callback.
 * Useful for closing dropdowns, modals, and popovers when the user clicks elsewhere.
 *
 * @param target - Element to detect clicks outside of
 * @param handler - Callback invoked when a click outside the target is detected
 * @param options - Optional configuration including ignore list and injector
 * @returns An OnClickOutsideRef with a destroy method to stop detection
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     <div #dropdown class="dropdown">
 *       <p>Dropdown content</p>
 *     </div>
 *   `
 * })
 * class Dropdown {
 *   readonly dropdown = viewChild<ElementRef>('dropdown');
 *   readonly isOpen = signal(true);
 *
 *   constructor() {
 *     onClickOutside(this.dropdown, () => {
 *       this.isOpen.set(false);
 *     });
 *   }
 * }
 * ```
 */
export function onClickOutside(
  target: MaybeElementSignal<HTMLElement>,
  handler: (event: PointerEvent | FocusEvent) => void,
  options?: OnClickOutsideOptions
): OnClickOutsideRef {
  const { runInContext } = setupContext(options?.injector, onClickOutside);

  return runInContext(({ isServer }) => {
    if (isServer) {
      return NOOP_EFFECT_REF;
    }

    const ignoreList = options?.ignore ?? [];

    let shouldFire = false;

    function isOutside(event: Event): boolean {
      const el = toElement(target);
      const path = event.composedPath();

      if (el && path.includes(el)) {
        return false;
      }

      if (ignoreList.length) {
        return !ignoreList.some(ignored => {
          const ignoredEl = toElement(ignored);
          return ignoredEl && path.includes(ignoredEl);
        });
      }

      return true;
    }

    const pointerDownListener = setupSync(() =>
      listener.capture(window, 'pointerdown', (e: PointerEvent) => {
        shouldFire = isOutside(e);
      })
    );

    const clickListener = setupSync(() =>
      listener.capture(window, 'pointerup', (e: PointerEvent) => {
        if (!shouldFire) {
          return;
        }

        shouldFire = false;

        if (!isOutside(e)) {
          return;
        }

        handler(e);
      })
    );

    const blurListener = setupSync(() =>
      listener(window, 'blur', (e: FocusEvent) => {
        setTimeout(() => {
          const active = document.activeElement;

          if (active?.tagName !== 'IFRAME') {
            return;
          }

          const el = toElement(target);

          if (el?.contains(active)) {
            return;
          }

          handler(e);
        }, 0);
      })
    );

    return {
      destroy: () => {
        pointerDownListener.destroy();
        clickListener.destroy();
        blurListener.destroy();
      },
    };
  });
}

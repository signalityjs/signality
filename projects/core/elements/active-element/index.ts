import { type CreateSignalOptions, type Signal, signal } from '@angular/core';
import {
  constSignal,
  createToken,
  getActiveElement,
  getEventTarget,
  getShadowRoot,
  setupContext,
} from '@signality/core/internal';
import type { WithInjector } from '@signality/core/types';
import { listener, type ListenerRef, setupSync } from '@signality/core/browser/listener';
import { onDisconnect } from '@signality/core/elements/on-disconnect';

export type ActiveElementOptions = CreateSignalOptions<Element | null> & WithInjector;

/**
 * Signal-based wrapper around the [document.activeElement](https://developer.mozilla.org/en-US/docs/Web/API/Document/activeElement) property.
 *
 * @param options - Optional configuration including signal options and injector
 * @returns A signal containing the currently active element, or null
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     @if (activeEl(); as el) {
 *       <p>Active element: {{ el.tagName }}</p>
 *     } @else {
 *       <p>No element is active</p>
 *     }
 *   `
 * })
 * export class ActiveElementDemo {
 *   readonly activeEl = activeElement();
 * }
 * ```
 */
export function activeElement(options?: ActiveElementOptions): Signal<Element | null> {
  const { runInContext } = setupContext(options?.injector, activeElement);

  return runInContext(({ isServer, injector }) => {
    if (isServer) {
      return constSignal(null);
    }

    const activeEl = signal<Element | null>(getActiveElement(document), options);

    let shadowFocusinListener: ListenerRef | null;
    let shadowFocusoutListener: ListenerRef | null;

    const updateActiveElement = () => {
      activeEl.set(getActiveElement(document));
    };

    const cleanupShadowListeners = () => {
      shadowFocusinListener?.destroy();
      shadowFocusinListener = null;
      shadowFocusoutListener?.destroy();
      shadowFocusoutListener = null;
    };

    const setupShadowListeners = (target: Element | null) => {
      cleanupShadowListeners();

      if (!target) {
        return;
      }

      const shadowRoot = getShadowRoot(target);

      if (!shadowRoot) {
        return;
      }

      shadowFocusinListener = listener(shadowRoot, 'focusin', updateActiveElement, { injector });

      shadowFocusoutListener = listener(
        shadowRoot,
        'focusout',
        () => {
          setTimeout(() => {
            updateActiveElement();
            setupShadowListeners(activeEl());
          });
        },
        { injector }
      );
    };

    setupSync(() => {
      listener.capture(window, 'focusin', (e: FocusEvent) => {
        updateActiveElement();
        setupShadowListeners(getEventTarget(e));
      });

      listener.capture(window, 'focusout', (e: FocusEvent) => {
        if (e.relatedTarget === null) {
          updateActiveElement();
        }
      });
    });

    onDisconnect(activeEl, () => {
      cleanupShadowListeners();
      updateActiveElement();
    });

    return activeEl.asReadonly();
  });
}

export const ACTIVE_ELEMENT = /* @__PURE__ */ createToken(activeElement);

import { type CreateSignalOptions, type Signal, signal } from '@angular/core';
import { constSignal, createToken, setupContext } from '@signality/core/internal';
import type { WithInjector } from '@signality/core/types';
import { listener, setupSync } from '@signality/core/browser/listener';

export type PageVisibilityOptions = CreateSignalOptions<DocumentVisibilityState> & WithInjector;

/**
 * Signal-based wrapper around the [Page Visibility API](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API).
 *
 * @param options - Optional configuration including signal options and injector
 * @returns A signal containing the current DocumentVisibilityState ('visible' or 'hidden')
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     @if (visibility() === 'hidden') {
 *       <p>Page is hidden</p>
 *     } @else {
 *       <p>Page is visible</p>
 *     }
 *   `
 * })
 * class VisibilityDemo {
 *   readonly visibility = pageVisibility();
 * }
 * ```
 */
export function pageVisibility(options?: PageVisibilityOptions): Signal<DocumentVisibilityState> {
  const { runInContext } = setupContext(options?.injector, pageVisibility);

  return runInContext(({ isServer }) => {
    if (isServer) {
      return constSignal('visible');
    }

    const visibilityState = signal(document.visibilityState, options);

    setupSync(() => {
      listener(document, 'visibilitychange', () => visibilityState.set(document.visibilityState));
    });

    return visibilityState.asReadonly();
  });
}

export const PAGE_VISIBILITY = /* @__PURE__ */ createToken(pageVisibility);

import { type CreateSignalOptions, type Signal, signal } from '@angular/core';
import { constSignal, createToken, setupContext } from '@signality/core/internal';
import type { WithInjector } from '@signality/core/types';
import { listener, setupSync } from '@signality/core/browser/listener';

export type WindowFocusOptions = CreateSignalOptions<boolean> & WithInjector;

/**
 * Signal-based wrapper around the [Window focus/blur events](https://developer.mozilla.org/en-US/docs/Web/API/Window/focus_event).
 *
 * @param options - Optional configuration including signal options and injector
 * @returns A signal containing the current window focus state (`true` if focused, `false` if blurred)
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     @if (isFocused()) {
 *       <p>Window is focused</p>
 *     } @else {
 *       <p>Window is not focused</p>
 *     }
 *   `
 * })
 * export class FocusDemo {
 *   readonly isFocused = windowFocus();
 * }
 * ```
 */
export function windowFocus(options?: WindowFocusOptions): Signal<boolean> {
  const { runInContext } = setupContext(options?.injector, windowFocus);

  return runInContext(({ isServer }) => {
    if (isServer) {
      return constSignal(true);
    }

    const isFocused = signal(document.hasFocus(), options);

    setupSync(() => {
      listener(window, 'focus', () => isFocused.set(true));
      listener(window, 'blur', () => isFocused.set(false));
    });

    return isFocused.asReadonly();
  });
}

export const WINDOW_FOCUS = /* @__PURE__ */ createToken(windowFocus);

import { type CreateSignalOptions, type Signal, signal } from '@angular/core';
import { constSignal, createToken, setupContext } from '@signality/core/internal';
import type { WithInjector } from '@signality/core/types';
import { listener, setupSync } from '@signality/core/browser/listener';

export interface BrowserLanguageOptions extends CreateSignalOptions<string>, WithInjector {
  /**
   * Initial value for SSR.
   * @default ''
   */
  readonly initialValue?: string;
}

/**
 * Reactive wrapper around the [Navigator.language](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/language) property.
 *
 * @param options - Optional configuration including signal options and injector
 * @returns A signal containing the current browser language in BCP 47 format (e.g., 'en-US', 'fr-FR')
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     <p>Current language: {{ language() }}</p>
 *     @if (language() === 'en-US') {
 *       <p>Welcome!</p>
 *     } @else if (language() === 'fr-FR') {
 *       <p>Bienvenue!</p>
 *     }
 *   `
 * })
 * class LanguageDemo {
 *   readonly language = browserLanguage();
 * }
 * ```
 */
export function browserLanguage(options?: BrowserLanguageOptions): Signal<string> {
  const { runInContext } = setupContext(options?.injector, browserLanguage);

  return runInContext(({ isServer }) => {
    if (isServer) {
      return constSignal(options?.initialValue ?? '');
    }

    const language = signal(navigator.language, options);

    setupSync(() => {
      listener(window, 'languagechange', () => language.set(navigator.language));
    });

    return language.asReadonly();
  });
}

export const BROWSER_LANGUAGE = /* @__PURE__ */ createToken(browserLanguage);

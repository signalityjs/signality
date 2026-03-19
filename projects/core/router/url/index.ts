import { type CreateSignalOptions, inject, signal, type Signal } from '@angular/core';
import { Router } from '@angular/router';
import { constSignal, setupContext } from '@signality/core/internal';
import type { WithInjector } from '@signality/core/types';
import { routerListener } from '@signality/core/router/router-listener';

export interface UrlOptions extends CreateSignalOptions<string>, WithInjector {
  /**
   * Include origin (protocol + host) for absolute URL.
   * @default false
   */
  readonly absolute?: boolean;
}

/**
 * Reactive wrapper around the [Angular Router](https://angular.dev/guide/routing) current URL.
 *
 * @param options - Optional configuration
 * @returns A signal containing the current URL
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     <div>
 *       <p>Current URL: {{ currentUrl() }}</p>
 *       <p>Absolute URL: {{ absoluteUrl() }}</p>
 *     </div>
 *   `
 * })
 * export class UrlDemo {
 *   readonly currentUrl = url();
 *   readonly absoluteUrl = url({ absolute: true });
 * }
 * ```
 */
export function url(options?: UrlOptions): Signal<string> {
  const { runInContext } = setupContext(options?.injector, url);

  return runInContext(({ isServer }) => {
    const router = inject(Router);

    if (isServer) {
      return constSignal(router.url);
    }

    const getUrl = () => {
      const relativeUrl = router.url;

      if (options?.absolute) {
        return location.origin + relativeUrl;
      }

      return relativeUrl;
    };

    const result = signal(getUrl(), options);

    routerListener('navigationend', () => result.set(getUrl()));

    return result.asReadonly();
  });
}

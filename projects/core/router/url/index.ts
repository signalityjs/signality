import { type CreateSignalOptions, inject, REQUEST, signal, type Signal } from '@angular/core';
import { Router } from '@angular/router';
import { constSignal, setupContext } from '@signality/core/internal';
import type { WithInjector } from '@signality/core/types';
import { routerListener } from '@signality/core/router/router-listener';

export interface UrlOptions extends CreateSignalOptions<string>, WithInjector {
  /**
   * Include origin (protocol + host) for absolute URL.
   *
   * On the server the origin comes from the `REQUEST` token. While prerendering there is no
   * request, so the origin is unknown and the signal falls back to a relative URL.
   *
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
      const relativeUrl = router.url;

      if (!options?.absolute) {
        return constSignal(relativeUrl);
      }

      const request = inject(REQUEST, { optional: true });
      if (!request) {
        if (ngDevMode) {
          console.warn(
            '[url] `absolute` is ignored while prerendering, because the deployment origin is unknown at build time. Falling back to a relative URL.'
          );
        }

        return constSignal(relativeUrl);
      }

      return constSignal(new URL(request.url).origin + relativeUrl);
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

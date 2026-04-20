import { inject, linkedSignal, type CreateSignalOptions, type WritableSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, type NavigationExtras } from '@angular/router';
import { proxySignal, setupContext } from '@signality/core/internal';
import type { WithInjector } from '@signality/core/types';

export type FragmentOptions = CreateSignalOptions<string | null> &
  WithInjector &
  Pick<NavigationExtras, 'replaceUrl'>;

/**
 * Reactive wrapper around the [Angular Router](https://angular.dev/guide/routing) URL fragment.
 *
 * @param options - Optional configuration including signal options, injector and navigation behavior
 * @returns A writable signal containing the current URL fragment (without #), or null
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     @if (currentFragment(); as fragment) {
 *       <p>Current section: {{ fragment }}</p>
 *     } @else {
 *       <p>No fragment in URL</p>
 *     }
 *   `
 * })
 * export class FragmentDemo {
 *   readonly currentFragment = fragment();
 * }
 * ```
 */
export function fragment(options?: FragmentOptions): WritableSignal<string | null> {
  const { runInContext } = setupContext(options?.injector, fragment);

  return runInContext(() => {
    const router = inject(Router);
    const { fragment: fragmentChanges, snapshot } = inject(ActivatedRoute);

    const fragment = linkedSignal(
      toSignal(fragmentChanges, { ...options, initialValue: snapshot.fragment })
    );

    return proxySignal(fragment, {
      set: async (fragment, source) => {
        const succeeded = await router.navigate([], {
          fragment: fragment ?? undefined,
          replaceUrl: options?.replaceUrl,
          queryParamsHandling: 'preserve',
        });
        if (succeeded) source.set(fragment);
      },
    });
  });
}

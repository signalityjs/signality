import { type CreateSignalOptions, inject, type Signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { setupContext } from '@signality/core/internal';
import type { WithInjector } from '@signality/core/types';

export type FragmentOptions = CreateSignalOptions<string | null> & WithInjector;

/**
 * Reactive wrapper around the [Angular Router](https://angular.dev/guide/routing) URL fragment.
 *
 * @param options - Optional configuration including signal options and injector
 * @returns A signal containing the current URL fragment (without #), or null
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
export function fragment(options?: FragmentOptions): Signal<string | null> {
  const { runInContext } = setupContext(options?.injector, fragment);

  return runInContext(() => {
    const { fragment: fragmentChanges, snapshot } = inject(ActivatedRoute);

    return toSignal(fragmentChanges, { ...options, initialValue: snapshot.fragment });
  });
}

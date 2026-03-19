import { type CreateSignalOptions, inject, type Signal } from '@angular/core';
import { ActivatedRoute, type Params } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import type { Observable } from 'rxjs';
import { setupContext } from '@signality/core/internal';
import type { WithInjector } from '@signality/core/types';

export type ParamsOptions<T extends Params = Params> = CreateSignalOptions<T> & WithInjector;

/**
 * Reactive wrapper around Angular Router's route parameters.
 * Access route parameters as a signal that updates when navigation occurs.
 *
 * @param options - Optional configuration including signal options and injector
 * @returns A signal containing the current route parameters
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     <div>
 *       <p>User ID: {{ routeParams().id }}</p>
 *       <p>Slug: {{ routeParams().slug }}</p>
 *     </div>
 *   `
 * })
 * export class UserPreview {
 *   // Route: /user/:id/:slug
 *   readonly routeParams = params<{ id: string; slug: string }>();
 * }
 * ```
 */
export function params<T extends Params = Params>(options?: ParamsOptions<T>): Signal<T> {
  const { runInContext } = setupContext(options?.injector, params);

  return runInContext(() => {
    const { params: paramsChanges, snapshot } = inject(ActivatedRoute);

    return toSignal<T, T>(paramsChanges as Observable<T>, {
      ...options,
      initialValue: snapshot.params as T,
    });
  });
}

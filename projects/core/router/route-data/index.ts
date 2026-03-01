import { type CreateSignalOptions, inject, type Signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import type { Observable } from 'rxjs';
import { setupContext } from '@signality/core/internal';
import type { WithInjector } from '@signality/core/types';

export type RouteDataOptions<T = unknown> = CreateSignalOptions<T> & WithInjector;

/**
 * Reactive wrapper around the [Angular Router](https://angular.dev/guide/routing) route data.
 *
 * @param options - Optional configuration including signal options and injector
 * @returns A signal containing the current route data
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     <div>
 *       <h1>{{ data().name }}</h1>
 *       @if (data().showBreadcrumbs) {
 *         <nav>Breadcrumbs here</nav>
 *       }
 *     </div>
 *   `
 * })
 * class ProductComponent {
 *   // Route with data: { name: 'Product Page', showBreadcrumbs: true }
 *   readonly data = routeData<{ name: string; showBreadcrumbs: boolean }>();
 * }
 * ```
 */
export function routeData<T = unknown>(options?: RouteDataOptions<T>): Signal<T> {
  const { runInContext } = setupContext(options?.injector, routeData);

  return runInContext(() => {
    const { data, snapshot } = inject(ActivatedRoute);

    return toSignal<T, T>(data as Observable<T>, {
      ...options,
      initialValue: snapshot.data as T,
    });
  });
}

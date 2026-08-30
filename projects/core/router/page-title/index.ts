import { type CreateSignalOptions, inject, linkedSignal, type WritableSignal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { setupContext } from '@signality/core/internal';
import type { WithInjector } from '@signality/core/types';
import { proxySignal } from '@signality/core/reactivity/proxy-signal';

export type PageTitleOptions = CreateSignalOptions<string> & WithInjector;

/**
 * Reactive wrapper around the [Angular Router](https://angular.dev/guide/routing) route title.
 *
 * @param options - Optional configuration
 * @returns A writable signal containing the current route title (string)
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     <div>
 *       <h1>{{ title() }}</h1>
 *       <button (click)="updateTitle()">Update Title</button>
 *     </div>
 *   `
 * })
 * export class Page {
 *   readonly title = pageTitle();
 *
 *   updateTitle() {
 *     this.title.set('New Page Title');
 *   }
 * }
 * ```
 */
export function pageTitle(options?: PageTitleOptions): WritableSignal<string> {
  const { runInContext } = setupContext(options?.injector, pageTitle);

  return runInContext(() => {
    const route = inject(ActivatedRoute);
    const html = inject(Title);

    const source = linkedSignal(
      toSignal<string, string>(route.title.pipe(filter(Boolean)), {
        initialValue: route.snapshot.title || html.getTitle(),
      }),
      { ...options }
    );

    return proxySignal(
      source,
      {
        set: value => {
          html.setTitle(value);
          source.set(value);
        },
      },
      { equal: options?.equal }
    );
  });
}

import { type CreateSignalOptions, inject, linkedSignal, type WritableSignal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { setupContext } from '@signality/core/internal';
import type { WithInjector } from '@signality/core/types';
import { proxySignal } from '@signality/core/reactivity/proxy-signal';

export type TitleOptions = CreateSignalOptions<string> & WithInjector;

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
 *       <h1>{{ pageTitle() }}</h1>
 *       <button (click)="updateTitle()">Update Title</button>
 *     </div>
 *   `
 * })
 * export class Page {
 *   readonly pageTitle = title();
 *
 *   updateTitle() {
 *     this.pageTitle.set('New Page Title');
 *   }
 * }
 * ```
 */
export function title(options?: TitleOptions): WritableSignal<string> {
  const { runInContext } = setupContext(options?.injector, title);

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
          source.set(value);
          html.setTitle(value);
        },
      },
      { equal: options?.equal }
    );
  });
}

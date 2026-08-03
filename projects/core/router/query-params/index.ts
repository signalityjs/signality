import {
  computed,
  type CreateSignalOptions,
  inject,
  linkedSignal,
  type Signal,
  type WritableSignal,
} from '@angular/core';
import { ActivatedRoute, type NavigationExtras, type Params, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import type { Observable } from 'rxjs';
import { setupContext } from '@signality/core/internal';
import type { WithInjector } from '@signality/core/types';
import { proxySignal } from '@signality/core/reactivity/proxy-signal';

export interface QueryParamsValidator<T> {
  /**
   * Parse and validate data, throwing an error if validation fails.
   */
  parse(data: unknown): T;
}

export interface QueryParamsRef<T> {
  /**
   * Writable signal containing validated query parameters.
   *
   * Reading throws an error if validation failed. Use `isValid()` to check before reading.
   * Writing navigates to the current route with the given query parameters, replacing the
   * existing ones. Writing is allowed even while the current parameters are invalid.
   */
  readonly value: WritableSignal<T>;

  /**
   * Signal indicating whether the current query parameters are valid.
   * Returns `true` when validation succeeded, `false` when validation failed.
   */
  readonly isValid: Signal<boolean>;

  /**
   * Signal containing validation error, or null if valid.
   */
  readonly error: Signal<unknown | null>;
}

export type QueryParamsOptions<T extends Params = Params> = CreateSignalOptions<T> &
  WithInjector &
  Pick<NavigationExtras, 'replaceUrl'>;

export type QueryParamsWithSchemaOptions<T extends Params = Params> = QueryParamsOptions<T> & {
  /** Validator schema (e.g., Zod schema) */
  readonly schema: QueryParamsValidator<T>;
};

/**
 * Reactive wrapper around the [Angular Router](https://angular.dev/guide/routing) query parameters.
 *
 * @param options - Optional configuration including signal options, injector and navigation behavior
 * @returns A writable signal containing the current query parameters
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     <div>
 *       <p>Search: {{ searchParams().q }}</p>
 *       <p>Sort: {{ searchParams().sort }}</p>
 *       <button (click)="sortByDate()">Sort by date</button>
 *     </div>
 *   `
 * })
 * export class SearchParamsDemo {
 *   // Route: /search?q=angular&sort=name
 *   readonly searchParams = queryParams<{ q: string; sort: string }>();
 *
 *   sortByDate() {
 *     this.searchParams.update(params => ({ ...params, sort: 'date' }));
 *   }
 * }
 * ```
 */
export function queryParams<T extends Params = Params>(
  options?: QueryParamsOptions<T>
): WritableSignal<T>;

/**
 * Reactive wrapper around the [Angular Router](https://angular.dev/guide/routing) query parameters with schema validation.
 *
 * @param options - Configuration including schema validator
 * @returns A QueryParamsRef object with a writable value, isValid, and error signals
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     @if (params.isValid()) {
 *       <p>Search: {{ params.value().q }}</p>
 *       <p>Page: {{ params.value().page }}</p>
 *       <button (click)="nextPage()">Next page</button>
 *     } @else {
 *       <p>Invalid parameters</p>
 *     }
 *   `
 * })
 * export class ValidatedSearchParamsDemo {
 *   readonly schema = z.object({
 *     q: z.string().min(1).optional(),
 *     page: z.coerce.number().int().positive().default(1),
 *   });
 *
 *   readonly params = queryParams({ schema: this.schema });
 *
 *   nextPage() {
 *     this.params.value.update(params => ({ ...params, page: params.page + 1 }));
 *   }
 * }
 * ```
 */
export function queryParams<T extends Params = Params>(
  options: QueryParamsWithSchemaOptions<T>
): QueryParamsRef<T>;

export function queryParams<T extends Params = Params>(
  options?: QueryParamsOptions<T> | QueryParamsWithSchemaOptions<T>
): WritableSignal<T> | QueryParamsRef<T> {
  const { runInContext } = setupContext(options?.injector, queryParams);

  return runInContext(() => {
    const router = inject(Router);
    const { queryParams: paramsChanges, snapshot } = inject(ActivatedRoute);
    const hasSchema = options && 'schema' in options && options.schema !== undefined;

    const rawParams = toSignal<T, T>(paramsChanges as Observable<T>, {
      initialValue: snapshot.queryParams as T,
    });

    const set = async (params: T, source: WritableSignal<T>) => {
      const succeeded = await router.navigate([], {
        queryParams: params,
        queryParamsHandling: 'replace',
        preserveFragment: true,
        replaceUrl: options?.replaceUrl,
      });

      if (succeeded) {
        source.set(params);
      }
    };

    if (!hasSchema) {
      const source = linkedSignal(rawParams, { ...options });
      return proxySignal(source, { set }, { equal: options?.equal });
    }

    const schema = options.schema;

    const result = computed(() => {
      try {
        return { valid: true, value: schema.parse(rawParams()), error: null } as const;
      } catch (error) {
        return { valid: false, value: null, error } as const;
      }
    });

    const { equal, debugName } = options;

    // the parsed value is `null` while the params are invalid, which a custom `equal` isn't meant to handle
    const parsedEqual = equal && ((a: T, b: T) => a != null && b != null && equal(a, b));

    const parsedValue = linkedSignal(() => result().value as T, {
      equal: parsedEqual,
      debugName: debugName ? `${debugName}.value` : undefined,
    });

    const isValid = computed(() => result().valid);
    const error = computed(() => result().error);
    const writableValue = proxySignal(parsedValue, { set }, { equal: parsedEqual });

    const value = proxySignal(writableValue, {
      get: parsed => {
        const err = error();

        if (err !== null) {
          throw err;
        }

        return parsed();
      },
    });

    return { value, isValid, error };
  });
}

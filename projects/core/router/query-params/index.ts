import { computed, type CreateSignalOptions, inject, signal, type Signal } from '@angular/core';
import { ActivatedRoute, type Params } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, type Observable } from 'rxjs';
import { setupContext } from '@signality/core/internal';
import type { WithInjector } from '@signality/core/types';

export interface QueryParamsValidator<T> {
  /**
   * Parse and validate data, throwing an error if validation fails.
   */
  parse(data: unknown): T;
}

export interface QueryParamsRef<T> {
  /**
   * Signal containing validated query parameters.
   * Throws an error if validation failed. Use `isValid()` to check before reading.
   */
  readonly value: Signal<T>;

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

export type QueryParamsOptions<T extends Params = Params> = CreateSignalOptions<T> & WithInjector;

export type QueryParamsWithSchemaOptions<T extends Params = Params> = QueryParamsOptions<T> & {
  /** Validator schema (e.g., Zod schema) */
  readonly schema: QueryParamsValidator<T>;
};

/**
 * Reactive wrapper around the [Angular Router](https://angular.dev/guide/routing) query parameters.
 *
 * @param options - Optional configuration including signal options and injector
 * @returns A signal containing the current query parameters
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     <div>
 *       <p>Search: {{ searchParams().q }}</p>
 *       <p>Sort: {{ searchParams().sort }}</p>
 *     </div>
 *   `
 * })
 * export class SearchParamsDemo {
 *   // Route: /search?q=angular&sort=name
 *   readonly searchParams = queryParams<{ q: string; sort: string }>();
 * }
 * ```
 */
export function queryParams<T extends Params = Params>(options?: QueryParamsOptions<T>): Signal<T>;

/**
 * Reactive wrapper around the [Angular Router](https://angular.dev/guide/routing) query parameters with schema validation.
 *
 * @param options - Configuration including schema validator
 * @returns A QueryParamsRef object with value, isValid, and error signals
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     @if (params.isValid()) {
 *       <p>Search: {{ params.value().q }}</p>
 *       <p>Page: {{ params.value().page }}</p>
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
 * }
 * ```
 */
export function queryParams<T extends Params = Params>(
  options: QueryParamsWithSchemaOptions<T>
): QueryParamsRef<T>;

export function queryParams<T extends Params = Params>(
  options?: QueryParamsOptions<T> | QueryParamsWithSchemaOptions<T>
): Signal<T> | QueryParamsRef<T> {
  const { runInContext } = setupContext(options?.injector, queryParams);

  return runInContext(() => {
    const { queryParams: paramsChanges, snapshot } = inject(ActivatedRoute);
    const hasSchema = options && 'schema' in options && options.schema !== undefined;

    if (!hasSchema) {
      return toSignal<T, T>(paramsChanges as Observable<T>, {
        ...options,
        initialValue: snapshot.queryParams as T,
      });
    }

    const schema = options.schema;
    const initialRaw = snapshot.queryParams as T;

    let initialValue: T | null = null;
    let initialError: unknown | null = null;

    try {
      initialValue = schema.parse(initialRaw);
    } catch (err) {
      initialError = err;
    }

    const error = signal<unknown | null>(initialError);
    const isValid = signal(!initialError);

    const validatedValue = toSignal<T | null, T | null>(
      paramsChanges.pipe(
        map(rawParams => {
          try {
            const parsed = schema.parse(rawParams);
            isValid.set(true);
            error.set(null);
            return parsed;
          } catch (err) {
            isValid.set(false);
            error.set(err);
            return null;
          }
        })
      ),
      { initialValue }
    );

    const value = computed(
      () => {
        const validated = validatedValue();
        const err = error();

        if (err !== null) {
          throw err;
        }

        return validated!;
      },
      {
        ...options,
        debugName: options.debugName ? `${options.debugName}.value` : undefined,
      }
    );

    return {
      value,
      isValid: isValid.asReadonly(),
      error: error.asReadonly(),
    };
  });
}

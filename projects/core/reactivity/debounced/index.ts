import {
  type CreateSignalOptions,
  isSignal,
  signal,
  type Signal,
  type WritableSignal,
} from '@angular/core';
import { proxySignal, setupContext, toValue } from '@signality/core/internal';
import type { MaybeSignal, SignalValue, WithInjector } from '@signality/core/types';
import { debounceCallback } from '@signality/core/scheduling/debounce-callback';
import { watcher } from '@signality/core/reactivity/watcher';

export type DebouncedOptions<T> = CreateSignalOptions<T> & WithInjector;

/**
 * Creates a debounced readonly signal from a source signal.
 * Updates to the source signal are debounced before propagating to the returned signal.
 *
 * @param source - Source signal to debounce
 * @param timeMs - Debounce delay in milliseconds
 * @param options - Optional configuration including signal options and injector
 * @returns A readonly signal that updates after the debounce delay
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     <input [(ngModel)]="query" />
 *     <p>Debounced value: {{ debouncedQuery() }}</p>
 *   `
 * })
 * export class SearchInput {
 *   readonly query = signal('');
 *   readonly debouncedQuery = debounced(this.query, 300);
 * }
 * ```
 */
export function debounced<S extends Signal<any>>(
  source: S,
  timeMs: MaybeSignal<number>,
  options?: DebouncedOptions<SignalValue<S>>
): Signal<SignalValue<S>>;

/**
 * Creates a debounced writable signal from an initial value.
 * Both `set()` and `update()` calls are debounced.
 *
 * @param value - Initial value
 * @param timeMs - Debounce delay in milliseconds
 * @param options - Optional configuration including signal options and injector
 * @returns A writable signal where updates are debounced
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     <input [(ngModel)]="query" />
 *     <p>Search results for: {{ query() }}</p>
 *   `
 * })
 * export class SearchInput {
 *   readonly query = debounced('', 300);
 * }
 * ```
 */
export function debounced<V>(
  value: V,
  timeMs: MaybeSignal<number>,
  options?: DebouncedOptions<V>
): WritableSignal<V>;

export function debounced(
  valueOrSignal: any,
  timeMs: MaybeSignal<number>,
  options?: DebouncedOptions<any>
) {
  const { runInContext } = setupContext(options?.injector, debounced);

  return runInContext(() => {
    const initialValue = toValue(valueOrSignal);
    const output = signal(initialValue, options);
    const set = debounceCallback(output.set, timeMs);

    if (isSignal(valueOrSignal)) {
      watcher(valueOrSignal, set);
      return output.asReadonly();
    } else {
      return proxySignal(output, { set });
    }
  });
}

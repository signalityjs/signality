import { signal, type Signal } from '@angular/core';

/***
 * Creates a readonly signal.
 * This is primarily used to provide fallback values for states that cannot be
 * computed in the current environment. For example:
 * - During SSR where browser-only APIs are unavailable
 * - In environments that lack support for specific APIs
 * @internal
 */
export function constSignal<T>(value: T): Signal<T> {
  return signal(value).asReadonly();
}

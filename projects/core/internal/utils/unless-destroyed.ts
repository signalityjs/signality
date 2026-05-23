import { DestroyRef, inject, INJECTOR, type Injector } from '@angular/core';
import { NOOP_FN } from '../constants';

/**
 * Gates a one-shot Promise on the injection context lifetime.
 *
 * When the associated `DestroyRef` is destroyed before `promise` settles,
 * the returned Promise never settles, preventing downstream handlers from
 * executing against a destroyed injector.
 * @internal
 */
export async function unlessDestroyed<T>(
  promise: Promise<T>,
  injector: Injector = inject(INJECTOR)
): Promise<T> {
  const destroyRef = injector.get(DestroyRef);
  const result = await promise;
  return destroyRef.destroyed ? new Promise<T>(NOOP_FN) : result;
}

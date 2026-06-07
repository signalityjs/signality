import { DestroyRef, inject, INJECTOR } from '@angular/core';
import { NOOP_FN } from '../constants';

/**
 * Prevents downstream handlers from executing against a destroyed injector.
 * @internal
 */
export async function settleInContext<T>(
  promise: Promise<T>,
  injector = inject(INJECTOR)
): Promise<T> {
  const destroyRef = injector.get(DestroyRef);
  try {
    const result = await promise;
    return destroyRef.destroyed ? new Promise<T>(NOOP_FN) : result;
  } catch (error) {
    if (destroyRef.destroyed) {
      return new Promise<T>(NOOP_FN);
    } else {
      throw error;
    }
  }
}

import { isSignal, type Signal } from '@angular/core';
import { SIGNAL } from '@angular/core/primitives/signals';

/**
 * @internal
 *
 * Determines if a signal is a query signal (viewChild, contentChild).
 * Query signals have a special internal structure with a `_dirtyCounter` property that tracks
 * when query results change.

 * See: https://github.com/angular/angular/blob/main/packages/core/src/render3/queries/query_reactive.ts#L43
 */
export function isQuerySignal(val: unknown): val is Signal<unknown> {
  if (!isSignal(val)) {
    return false;
  }

  const node = val[SIGNAL] as object;
  return '_dirtyCounter' in node;
}

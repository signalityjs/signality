import { isSignal, untracked as _untracked } from '@angular/core';
import type { MaybeSignal } from '@signality/core/types';

export interface ToValueFn {
  <T>(maybeSignal: MaybeSignal<T>): T;
  untracked: <T>(maybeSignal: MaybeSignal<T>) => T;
}

// @TODO: Consider moving it out of internal
export const toValue: ToValueFn = (() => {
  const fn = toValueFn as ToValueFn;
  fn.untracked = v => toValueFn(v, true);
  return fn;
})();

function toValueFn<T>(maybeSignal: MaybeSignal<T>, untracked = false): T {
  if (isSignal(maybeSignal)) {
    return untracked ? _untracked(maybeSignal) : maybeSignal();
  }
  return maybeSignal;
}

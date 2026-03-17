import { type ElementRef, type Signal } from '@angular/core';
import type { MaybeElementSignal } from '@signality/core/types';
import { toValue } from './to-value';
import { unrefElement } from './unref-element';

export interface ToElementFn extends ToElementBase {
  untracked: ToElementBase;
}

export interface ToElementBase {
  <T extends Element>(element: T | ElementRef<T>): T;
  <T extends Element>(element: Signal<T | ElementRef<T> | null>): T | null;
  <T extends Element>(element: Signal<T | ElementRef<T> | undefined>): T | undefined;
  <T extends Element>(element: Signal<T | ElementRef<T> | null | undefined>): T | null | undefined;
  <T extends Element>(element: T | ElementRef<T> | Signal<T | ElementRef<T> | null | undefined>):
    | T
    | null
    | undefined;
}

// @TODO: Consider moving it out of internal
export const toElement: ToElementFn = (() => {
  const fn = toElementFn as ToElementFn;
  fn.untracked = v => toElementFn(v, true);
  return fn;
})();

function toElementFn<T extends Element>(
  maybeSignal: MaybeElementSignal<T>,
  untracked = false
): T | null | undefined {
  const raw = untracked ? toValue.untracked(maybeSignal) : toValue(maybeSignal);
  return unrefElement(raw);
}

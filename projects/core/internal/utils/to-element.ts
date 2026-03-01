import { ElementRef, type Signal } from '@angular/core';
import type { MaybeElementSignal } from '@signality/core/types';
import { toValue } from './to-value';

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

export const toElement: ToElementFn = (() => {
  const fn = toElementFn as ToElementFn;
  fn.untracked = v => toElementFn(v, true);
  return fn;
})();

function toElementFn<T extends Element>(
  maybeSignal: MaybeElementSignal<T>,
  untracked = false
): T | null | undefined {
  const value = untracked ? toValue.untracked(maybeSignal) : toValue(maybeSignal);

  if (value instanceof ElementRef) {
    return value.nativeElement;
  }

  return value;
}

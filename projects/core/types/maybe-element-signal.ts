import type { ElementRef, Signal } from '@angular/core';

export type MaybeElementSignal<T extends Element> =
  | T
  | ElementRef<T>
  | Signal<T | ElementRef<T> | null | undefined>;

import type { Signal } from '@angular/core';
import type { SignalValue } from './signal-value';

export type SignalValues<T extends readonly Signal<any>[]> = {
  readonly [K in keyof T]: SignalValue<T[K]>;
};

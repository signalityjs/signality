import type { Signal } from '@angular/core';

export type SignalValue<S> = S extends Signal<infer V> ? V : never;

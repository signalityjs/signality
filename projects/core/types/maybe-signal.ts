import type { Signal } from '@angular/core';

export type MaybeSignal<T> = T | Signal<T>;

import type { ElementRef } from '@angular/core';

export type UnrefElement<T> = T extends ElementRef<infer E> ? E : T;


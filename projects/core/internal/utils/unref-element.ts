import { ElementRef } from '@angular/core';

export function unrefElement<T>(value: T | ElementRef<T>): T {
  return value instanceof ElementRef ? value.nativeElement : value;
}

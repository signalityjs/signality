import { type CreateSignalOptions, type Signal, signal } from '@angular/core';
import { constSignal, setupContext } from '@signality/core/internal';
import type { WithInjector } from '@signality/core/types';
import { listener, setupSync } from '@signality/core/browser/listener';

export type PointerLockElementOptions = CreateSignalOptions<Element | null> & WithInjector;

/**
 * Reactive wrapper around the [Pointer Lock API](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_Lock_API).
 * Returns a signal that tracks the element that currently has pointer lock.
 *
 * @param options - Optional configuration including signal options and injector
 * @returns A signal containing the element with pointer lock, or `null` if no element has lock
 *
 * @example
 * ```typescript
 * const lockedElement = pointerLockElement();
 *
 * effect(() => {
 *   if (lockedElement()) {
 *     console.log('Pointer locked on:', lockedElement());
 *   }
 * });
 * ```
 */
export function pointerLockElement(options?: PointerLockElementOptions): Signal<Element | null> {
  const { runInContext } = setupContext(options?.injector, pointerLockElement);

  return runInContext(({ isServer }) => {
    if (isServer) {
      return constSignal(null);
    }

    const element = signal(document.pointerLockElement, options);

    setupSync(() => {
      listener(document, 'pointerlockchange', () => element.set(document.pointerLockElement));
      listener(document, 'pointerlockerror', () => element.set(null));
    });

    return element.asReadonly();
  });
}

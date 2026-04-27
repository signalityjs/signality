import { afterEveryRender, afterRenderEffect, DestroyRef, ElementRef, inject } from '@angular/core';
import { NOOP_EFFECT_REF, setupContext } from '@signality/core/internal';
import { toElement } from '@signality/core/utilities';
import type { MaybeElementSignal, WithInjector } from '@signality/core/types';

export type OnDisconnectOptions = WithInjector;

export interface OnDisconnectRef {
  readonly destroy: () => void;
}

/**
 * Executes a callback when an element is disconnected from the DOM.
 *
 * @param target - The element to watch for disconnection
 * @param callback - Callback to execute when the element is disconnected
 * @param options - Optional configuration including injector
 * @returns OnDisconnectRef with a destroy method to stop watching for disconnection
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     <div #box>Content</div>
 *     <button (click)="remove()">Remove</button>
 *   `
 * })
 * export class OnDisconnectDemo {
 *   readonly box = viewChild<ElementRef>('box');
 *
 *   constructor() {
 *     onDisconnect(this.box, el => {
 *       console.log('Element disconnected: ', el.tagName);
 *       // perform cleanup without storing the reference
 *     });
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Manual cleanup
 * const disconnectRef = onDisconnect(element, () => {
 *   console.log('Disconnected');
 * });
 *
 * // Stop watching before disconnection
 * disconnectRef.destroy();
 * ```
 */
export function onDisconnect<T extends Element>(
  target: MaybeElementSignal<T>,
  callback: (element: T) => void,
  options?: OnDisconnectOptions
): OnDisconnectRef {
  const { runInContext } = setupContext(options?.injector, onDisconnect);

  return runInContext(({ isServer }) => {
    if (isServer) {
      return NOOP_EFFECT_REF;
    }

    // If we are inside a directive and the target element is its host,
    // then we hook into the directive's lifecycle via its DestroyRef.
    const hostElRef = inject(ElementRef, { optional: true, self: true });
    if (hostElRef) {
      const targetEl = toElement(target);
      if (targetEl && hostElRef.nativeElement === targetEl) {
        return {
          destroy: inject(DestroyRef).onDestroy(() => callback(targetEl)),
        };
      }
    }

    const effectRef = afterRenderEffect({
      read: onCleanup => {
        const targetEl = toElement(target);

        if (targetEl) {
          onCleanup(() => {
            if (!targetEl.isConnected) {
              callback(targetEl);
            }
          });
        }
      },
    });

    const afterRenderRef = afterEveryRender({
      read: () => {
        const targetEl = toElement(target);

        if (targetEl && !targetEl.isConnected) {
          callback(targetEl);
        }
      },
    });

    return {
      destroy: () => {
        effectRef.destroy();
        afterRenderRef.destroy();
      },
    };
  });
}

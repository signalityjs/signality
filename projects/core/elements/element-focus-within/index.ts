import { type CreateSignalOptions, signal, type Signal } from '@angular/core';
import { constSignal, setupContext, toElement } from '@signality/core/internal';
import type { MaybeElementSignal, WithInjector } from '@signality/core/types';
import { listener } from '@signality/core/browser/listener';
import { onDisconnect } from '@signality/core/elements/on-disconnect';

export type ElementFocusWithinOptions = CreateSignalOptions<boolean> & WithInjector;

/**
 * Reactive tracking of focus-within state on an element.
 * Detects when focus is inside an element or any of its descendants,
 * analogous to the CSS `:focus-within` pseudo-class.
 *
 * @param target - The element to track focus-within state on
 * @param options - Optional configuration including signal options and injector
 * @returns A signal that is `true` when focus is within the element
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     <div #container [class.focused]="isFocusedWithin()">
 *       <input placeholder="First" />
 *       <input placeholder="Second" />
 *     </div>
 *   `
 * })
 * class FocusWithinComponent {
 *   readonly container = viewChild<ElementRef>('container');
 *   readonly isFocusedWithin = elementFocusWithin(this.container);
 * }
 * ```
 */
export function elementFocusWithin(
  target: MaybeElementSignal<HTMLElement>,
  options?: ElementFocusWithinOptions
): Signal<boolean> {
  const { runInContext } = setupContext(options?.injector, elementFocusWithin);

  return runInContext(({ isServer }) => {
    if (isServer) {
      return constSignal(false);
    }

    const focused = signal<boolean>(false, options);

    listener(target, 'focusin', () => focused.set(true));

    listener(target, 'focusout', e => {
      const el = toElement(target);

      if (el && e.relatedTarget instanceof Node && el.contains(e.relatedTarget)) {
        return;
      }

      focused.set(false);
    });

    onDisconnect(target, () => focused.set(false));

    return focused.asReadonly();
  });
}

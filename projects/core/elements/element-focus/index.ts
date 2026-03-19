import { type CreateSignalOptions, signal, type Signal } from '@angular/core';
import { constSignal, setupContext } from '@signality/core/internal';
import type { MaybeElementSignal, WithInjector } from '@signality/core/types';
import { listener } from '@signality/core/browser/listener';
import { onDisconnect } from '@signality/core/elements/on-disconnect';

export interface ElementFocusOptions extends CreateSignalOptions<boolean>, WithInjector {
  /**
   * Track focus using the `:focus-visible` pseudo-class.
   * The browser uses heuristics to determine when focus should be visually indicated
   * (e.g., keyboard navigation, programmatic focus, or when the element requires user attention).
   *
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:focus-visible MDN: :focus-visible}
   * @default false
   */
  readonly focusVisible?: boolean;
}

/**
 * Reactive tracking of focus state on an element.
 * Detects when an element gains or loses focus.
 *
 * @param target - The element to track focus state on
 * @param options - Optional configuration including focusVisible mode and injector
 * @returns A signal that is `true` when the element has focus
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     <input #input [class.focused]="isFocused()" />
 *     @if (isFocused()) {
 *       <p>Input is focused</p>
 *     }
 *   `
 * })
 * export class FocusDemo {
 *   readonly input = viewChild<ElementRef>('input');
 *   readonly isFocused = elementFocus(this.input);
 * }
 * ```
 */
export function elementFocus(
  target: MaybeElementSignal<HTMLElement>,
  options?: ElementFocusOptions
): Signal<boolean> {
  const { runInContext } = setupContext(options?.injector, elementFocus);

  return runInContext(({ isServer }) => {
    if (isServer) {
      return constSignal(false);
    }

    const focusVisible = options?.focusVisible ?? false;
    const focused = signal<boolean>(false, options);

    listener(target, 'focus', e => {
      focused.set(focusVisible ? (e.target as HTMLElement).matches(':focus-visible') : true);
    });

    listener(target, 'blur', () => {
      focused.set(false);
    });

    onDisconnect(target, () => focused.set(false));

    return focused.asReadonly();
  });
}

import { type CreateSignalOptions, signal, type WritableSignal } from '@angular/core';
import { assertElement, setupContext } from '@signality/core/internal';
import { toElement } from '@signality/core/utilities';
import type { MaybeElementSignal, WithInjector } from '@signality/core/types';
import { listener } from '@signality/core/browser/listener';
import { onDisconnect } from '@signality/core/elements/on-disconnect';
import { proxySignal } from '@signality/core/reactivity/proxy-signal';

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

  /**
   * Prevent scrolling to the element when it is focused.
   * @default false
   */
  readonly preventScroll?: boolean;
}

/**
 * Reactive tracking of focus state on an element.
 * Detects when an element gains or loses focus, and allows programmatically setting focus.
 *
 * @param target - The element to track focus state on
 * @param options - Optional configuration including focusVisible, preventScroll and injector
 * @returns A writable signal that is `true` when the element has focus
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     <input #input [class.focused]="isFocused()" />
 *     <button (click)="isFocused.set(true)">Focus Input</button>
 *     <button (click)="isFocused.set(false)">Blur Input</button>
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
): WritableSignal<boolean> {
  const { runInContext } = setupContext(options?.injector, elementFocus);

  return runInContext(({ isServer }) => {
    if (isServer) {
      return signal(false, options);
    }

    const focusVisible = options?.focusVisible ?? false;
    const preventScroll = options?.preventScroll ?? false;

    const focused = signal<boolean>(false, options);

    const setFocus = (focused: boolean) => {
      const el = toElement(target);
      ngDevMode && assertElement(el, 'elementFocus');
      const hasFocus = el!.matches(':focus') ?? false;

      if (focused && !hasFocus) {
        el!.focus({ preventScroll });
      } else if (!focused && hasFocus) {
        el!.blur();
      }
    };

    listener(target, 'focus', e => {
      focused.set(focusVisible ? (e.target as HTMLElement).matches(':focus-visible') : true);
    });

    listener(target, 'blur', () => {
      focused.set(false);
    });

    onDisconnect(target, () => {
      focused.set(false);
    });

    return proxySignal(focused, { set: setFocus }, { equal: options?.equal });
  });
}

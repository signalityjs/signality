import { type CreateSignalOptions, type Signal, signal } from '@angular/core';
import { constSignal, setupContext } from '@signality/core/internal';
import type { MaybeElementSignal, WithInjector } from '@signality/core/types';
import { listener } from '@signality/core/browser/listener';
import { onDisconnect } from '@signality/core/elements/on-disconnect';

export type ElementHoverOptions = CreateSignalOptions<boolean> & WithInjector;

/**
 * Reactive tracking of the hover state on an element.
 * Detects when the mouse enters or leaves an element.
 *
 * @param target - The element to track hover state on
 * @param options - Optional configuration including signal options and injector
 * @returns A signal that is `true` when the element is being hovered
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     <div #box [class.hovered]="isHovered()">
 *       Hover over me!
 *     </div>
 *   `
 * })
 * class HoverComponent {
 *   readonly box = viewChild<ElementRef>('box');
 *   readonly isHovered = elementHover(this.box);
 * }
 * ```
 */
export function elementHover(
  target: MaybeElementSignal<HTMLElement>,
  options?: ElementHoverOptions
): Signal<boolean> {
  const { runInContext } = setupContext(options?.injector, elementHover);

  return runInContext(({ isServer, isMobile }) => {
    if (isServer || isMobile) {
      return constSignal(false);
    }

    const hovered = signal<boolean>(false, options);

    listener(target, 'mouseenter', () => hovered.set(true));
    listener(target, 'mouseleave', () => hovered.set(false));

    onDisconnect(target, () => hovered.set(false));

    return hovered.asReadonly();
  });
}

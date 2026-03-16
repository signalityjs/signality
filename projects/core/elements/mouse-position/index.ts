import { type Signal, signal } from '@angular/core';
import { constSignal, isWindow, setupContext } from '@signality/core/internal';
import type { MaybeElementSignal, WithInjector } from '@signality/core/types';
import { listener } from '@signality/core/browser/listener';
import { onDisconnect } from '@signality/core/elements/on-disconnect';

export interface MousePosition {
  /** Horizontal coordinate in pixels. */
  readonly x: number;

  /** Vertical coordinate in pixels. */
  readonly y: number;
}

/**
 * Coordinate space used to report mouse position.
 *
 * - `'page'` — relative to the document origin, includes scroll offset.
 * - `'client'` — relative to the viewport, unaffected by scroll.
 * - `'screen'` — relative to the physical screen.
 *
 * @see [MouseEvent.pageX on MDN](https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/pageX)
 * @see [MouseEvent.clientX on MDN](https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/clientX)
 * @see [MouseEvent.screenX on MDN](https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/screenX)
 */
export type MouseCoordinateType = 'page' | 'client' | 'screen';

export interface MousePositionOptions extends WithInjector {
  /**
   * Element or `window` to track mouse position on.
   * When an element signal is provided, tracking stops on element disconnect.
   *
   * @default window
   */
  readonly target?: MaybeElementSignal<Element> | Window;

  /**
   * Coordinate space for the reported position. See {@link MouseCoordinateType}.
   *
   * @default 'page'
   */
  readonly type?: MouseCoordinateType;

  /**
   * Whether to also track touch events (`touchmove`).
   *
   * @default true
   * @see [TouchEvent on MDN](https://developer.mozilla.org/en-US/docs/Web/API/TouchEvent)
   */
  readonly touch?: boolean;

  /**
   * Initial value for SSR.
   *
   * @default { x: 0, y: 0 }
   */
  readonly initialValue?: MousePosition;
}

/**
 * Reactive tracking of mouse position using the [mousemove](https://developer.mozilla.org/en-US/docs/Web/API/Element/mousemove_event) event.
 * Track cursor coordinates globally or relative to an element.
 *
 * @param options - Optional configuration
 * @returns A signal containing the current mouse position
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     <p>Mouse position: X={{ position().x }}, Y={{ position().y }}</p>
 *   `
 * })
 * class MouseTracker {
 *   readonly position = mousePosition();
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Track mouse position on a specific element
 * @Component({
 *   template: `
 *     <div #box>
 *       <p>Position: X={{ position().x }}, Y={{ position().y }}</p>
 *     </div>
 *   `
 * })
 * class MouseElementTracker {
 *   readonly box = viewChild<ElementRef>('box');
 *   readonly position = mousePosition({ target: this.box });
 * }
 * ```
 */
export function mousePosition(options?: MousePositionOptions): Signal<MousePosition> {
  const { runInContext } = setupContext(options?.injector, mousePosition);

  return runInContext(({ isServer }) => {
    const initialValue = options?.initialValue ?? DEFAULT_POSITION;

    if (isServer) {
      return constSignal(initialValue);
    }

    const target = options?.target ?? window;
    const targetIsWindow = isWindow(target);
    const coordinateType = options?.type ?? 'page';
    const trackTouch = options?.touch ?? true;
    const trackScroll = coordinateType === 'page';
    const extractor = EXTRACTORS[coordinateType];

    const position = signal<MousePosition>(initialValue);

    let prevMouseEvent: MouseEvent | null = null;
    let prevScrollX = 0;
    let prevScrollY = 0;

    const handleMouse = (e: MouseEvent): void => {
      prevMouseEvent = e;

      position.set(extractor(e));

      if (trackScroll) {
        prevScrollX = window.scrollX;
        prevScrollY = window.scrollY;
      }
    };

    listener(target, 'mousemove', handleMouse);
    listener(target, 'dragover', handleMouse);

    if (trackTouch) {
      listener.passive(target, 'touchmove', (e: TouchEvent) => {
        if (e.touches.length === 0) {
          return;
        }

        position.set(extractor(e.touches[0]));
      });
    }

    if (trackScroll) {
      listener(window, 'scroll', () => {
        if (!prevMouseEvent) {
          return;
        }

        const pos = extractor(prevMouseEvent);

        position.set({
          x: pos.x + window.scrollX - prevScrollX,
          y: pos.y + window.scrollY - prevScrollY,
        });
      });
    }

    if (!targetIsWindow) {
      onDisconnect(target, () => position.set(DEFAULT_POSITION));
    }

    return position.asReadonly();
  });
}

const DEFAULT_POSITION: MousePosition = {
  x: 0,
  y: 0,
};

const EXTRACTORS: Record<MouseCoordinateType, (e: MouseEvent | Touch) => MousePosition> = {
  page: e => ({ x: e.pageX, y: e.pageY }),
  client: e => ({ x: e.clientX, y: e.clientY }),
  screen: e => ({ x: e.screenX, y: e.screenY }),
};

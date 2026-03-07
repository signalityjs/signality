import { type Signal, signal } from '@angular/core';
import {
  constSignal,
  isWindow,
  setupContext,
  type Timer,
  toElement,
} from '@signality/core/internal';
import type { MaybeElementSignal, WithInjector } from '@signality/core/types';
import { throttleCallback } from '@signality/core/scheduling/throttle-callback';
import { listener } from '@signality/core/browser/listener';
import { onDisconnect } from '@signality/core/elements/on-disconnect';

/**
 * State indicating which edges have been reached.
 */
export interface ArrivedState {
  readonly top: boolean;
  readonly bottom: boolean;
  readonly left: boolean;
  readonly right: boolean;
}

/**
 * Current scroll directions.
 */
export interface ScrollDirections {
  readonly top: boolean;
  readonly bottom: boolean;
  readonly left: boolean;
  readonly right: boolean;
}

export interface ScrollPositionOptions extends WithInjector {
  /**
   * Element or window to track scroll on.
   * @default window
   */
  readonly target?: MaybeElementSignal<Element> | Window;

  /**
   * Throttle scroll events in milliseconds.
   * @default 0
   */
  readonly throttle?: number;

  /**
   * Offset for arrived detection.
   */
  readonly offset?: {
    readonly top?: number;
    readonly bottom?: number;
    readonly left?: number;
    readonly right?: number;
  };
}

export interface ScrollPositionRef {
  /** Horizontal scroll position */
  readonly x: Signal<number>;

  /** Vertical scroll position */
  readonly y: Signal<number>;

  /** Whether currently scrolling */
  readonly isScrolling: Signal<boolean>;

  /** Which edges have been reached */
  readonly arrivedState: Signal<ArrivedState>;

  /** Current scroll direction */
  readonly directions: Signal<ScrollDirections>;
}

/**
 * Reactive tracking of scroll position.
 * Track scroll offset of window or any scrollable element.
 *
 * @param options - Optional configuration
 * @returns An object with x, y, isScrolling, arrivedState, and directions signals
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     <p>Scroll Y: {{ scrollPos.y() }}px</p>
 *     @if (scrollPos.isScrolling()) {
 *       <p>Scrolling...</p>
 *     }
 *     @if (scrollPos.arrivedState().bottom) {
 *       <p>Reached bottom!</p>
 *     }
 *   `
 * })
 * class ScrollTracker {
 *   readonly scrollPos = scrollPosition();
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Track scrolling on a specific element
 * @Component({
 *   template: `
 *     <div #scrollable style="overflow: auto; height: 200px;">
 *       <div style="height: 1000px;">Long content</div>
 *     </div>
 *     <p>Scroll position: {{ pos.y() }}</p>
 *   `
 * })
 * class ScrollableComponent {
 *   readonly scrollableEl = viewChild<ElementRef>('scrollable');
 *   readonly pos = scrollPosition({ target: this.scrollableEl });
 * }
 * ```
 */
export function scrollPosition(options?: ScrollPositionOptions): ScrollPositionRef {
  const { runInContext } = setupContext(options?.injector, scrollPosition);

  return runInContext(({ isServer, onCleanup }) => {
    if (isServer) {
      return {
        x: constSignal(0),
        y: constSignal(0),
        isScrolling: constSignal(false),
        arrivedState: constSignal(DEFAULT_ARRIVED),
        directions: constSignal(DEFAULT_DIRECTIONS),
      };
    }

    const target = options?.target ?? window;
    const targetIsWindow = isWindow(target);
    const offset = options?.offset ?? {};
    const throttleMs = options?.throttle ?? 0;

    const x = signal(0);
    const y = signal(0);
    const isScrolling = signal(false);
    const arrivedState = signal(DEFAULT_ARRIVED);
    const directions = signal(DEFAULT_DIRECTIONS);

    let lastX = 0;
    let lastY = 0;
    let scrollingTimeout: Timer;

    const getScrollPosition = (): { scrollX: number; scrollY: number } => {
      if (targetIsWindow) {
        return { scrollX: target.scrollX, scrollY: target.scrollY };
      }

      const el = toElement(target);
      return {
        scrollX: el?.scrollLeft || 0,
        scrollY: el?.scrollTop || 0,
      };
    };

    const getScrollSize = (): {
      scrollWidth: number;
      scrollHeight: number;
      clientWidth: number;
      clientHeight: number;
    } => {
      if (targetIsWindow) {
        return {
          scrollWidth: document.documentElement.scrollWidth,
          scrollHeight: document.documentElement.scrollHeight,
          clientWidth: target.innerWidth,
          clientHeight: target.innerHeight,
        };
      }

      const el = toElement(target);
      return {
        scrollWidth: el?.scrollWidth || 0,
        scrollHeight: el?.scrollHeight || 0,
        clientWidth: el?.clientWidth || 0,
        clientHeight: el?.clientHeight || 0,
      };
    };

    const update = () => {
      const { scrollX, scrollY } = getScrollPosition();
      const { scrollWidth, scrollHeight, clientWidth, clientHeight } = getScrollSize();

      directions.set({
        top: scrollY < lastY,
        bottom: scrollY > lastY,
        left: scrollX < lastX,
        right: scrollX > lastX,
      });

      lastX = scrollX;
      lastY = scrollY;

      x.set(scrollX);
      y.set(scrollY);

      const topOffset = offset.top ?? 0;
      const bottomOffset = offset.bottom ?? 0;
      const leftOffset = offset.left ?? 0;
      const rightOffset = offset.right ?? 0;

      arrivedState.set({
        top: scrollY <= topOffset,
        bottom: scrollY + clientHeight >= scrollHeight - bottomOffset,
        left: scrollX <= leftOffset,
        right: scrollX + clientWidth >= scrollWidth - rightOffset,
      });

      isScrolling.set(true);

      if (scrollingTimeout) {
        clearTimeout(scrollingTimeout);
      }

      scrollingTimeout = setTimeout(() => {
        isScrolling.set(false);
      }, SCROLL_IDLE_DELAY);
    };

    listener(target, 'scroll', throttleMs > 0 ? throttleCallback(update, throttleMs) : update);

    if (!targetIsWindow) {
      onDisconnect(target, () => {
        x.set(0);
        y.set(0);
        isScrolling.set(false);
        arrivedState.set(DEFAULT_ARRIVED);
        directions.set(DEFAULT_DIRECTIONS);
      });
    }

    onCleanup(() => {
      if (scrollingTimeout) {
        clearTimeout(scrollingTimeout);
      }
    });

    update();

    return {
      x: x.asReadonly(),
      y: y.asReadonly(),
      isScrolling: isScrolling.asReadonly(),
      arrivedState: arrivedState.asReadonly(),
      directions: directions.asReadonly(),
    };
  });
}

const DEFAULT_ARRIVED: ArrivedState = {
  top: true,
  bottom: false,
  left: true,
  right: false,
};

const DEFAULT_DIRECTIONS: ScrollDirections = {
  top: false,
  bottom: false,
  left: false,
  right: false,
};

const SCROLL_IDLE_DELAY = 150;

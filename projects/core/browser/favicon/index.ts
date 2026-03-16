import { inject, type Signal, signal, untracked } from '@angular/core';
import { APP_BASE_HREF } from '@angular/common';
import { constSignal, createToken, NOOP_FN, setupContext } from '@signality/core/internal';
import type { WithInjector } from '@signality/core/types';

export interface FaviconOptions extends WithInjector {
  /**
   * Base URL prepended to all favicon paths passed to `set()`.
   *
   * Resolution priority:
   * 1. Explicit `baseUrl` value
   * 2. [`APP_BASE_HREF`](https://angular.dev/api/common/APP_BASE_HREF) token value (if configured)
   * 3. Empty string `''`
   */
  readonly baseUrl?: string;
}

export interface FaviconRef {
  /**
   * URL of the currently active favicon.
   */
  readonly current: Signal<string>;

  /**
   * URL of the favicon at the time the utility was initialized.
   */
  readonly original: Signal<string>;

  /**
   * Set the favicon to the given URL.
   *
   * @see [HTMLLinkElement on MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTMLLinkElement)
   */
  readonly set: (url: string) => void;

  /**
   * Render an emoji onto a canvas and use it as the favicon.
   *
   * @see [Canvas API on MDN](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
   */
  readonly setEmoji: (emoji: string) => void;

  /**
   * Reset the favicon to the original URL captured on initialization.
   */
  readonly reset: () => void;
}

/**
 * Reactive favicon manipulation using the [HTMLLinkElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLLinkElement).
 * Dynamically change the page favicon based on application state.
 *
 * @param options - Optional configuration
 * @returns A FaviconRef with favicon control methods
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     <button (click)="setNotification()">Set Notification</button>
 *     <button (click)="fav.reset()">Reset Favicon</button>
 *     <p>Current: {{ fav.current() }}</p>
 *   `
 * })
 * class FaviconDemo {
 *   readonly fav = favicon();
 *
 *   setNotification() {
 *     this.fav.setEmoji('🔴');
 *   }
 * }
 * ```
 */
export function favicon(options?: FaviconOptions): FaviconRef {
  const { runInContext } = setupContext(options?.injector, favicon);

  return runInContext(({ isServer }) => {
    if (isServer) {
      return {
        current: constSignal(''),
        original: constSignal(''),
        set: NOOP_FN,
        setEmoji: NOOP_FN,
        reset: NOOP_FN,
      };
    }

    const appBaseHref = inject(APP_BASE_HREF, { optional: true });
    const baseUrl = options?.baseUrl ?? appBaseHref ?? '';

    const getLinkElement = (): HTMLLinkElement => {
      let link = document.querySelector<HTMLLinkElement>('link[rel*="icon"]');

      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }

      return link;
    };

    const { href = '' } = getLinkElement();
    const current = signal(href);
    const original = signal(href);

    const set = (url: string) => {
      const fullUrl = baseUrl + url;
      const linkEl = getLinkElement();
      linkEl.href = fullUrl;
      current.set(fullUrl);
    };

    const setEmoji = (emoji: string) => {
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.font = '28px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(emoji, 16, 18);

      const dataUrl = canvas.toDataURL('image/png');
      const linkEl = getLinkElement();
      linkEl.href = dataUrl;
      current.set(dataUrl);
    };

    const reset = () => {
      const linkEl = getLinkElement();
      const originalHref = untracked(original);
      linkEl.href = originalHref;
      current.set(originalHref);
    };

    return {
      current: current.asReadonly(),
      original: original.asReadonly(),
      set,
      setEmoji,
      reset,
    };
  });
}

export const FAVICON = /* @__PURE__ */ createToken(favicon);

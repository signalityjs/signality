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
 * export class FaviconDemo {
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

    const getLinkElements = (): HTMLLinkElement[] => {
      const links = Array.from(
        document.querySelectorAll<HTMLLinkElement>(
          'link[rel*="icon"]:not([rel*="apple-touch-icon"])'
        )
      );

      if (links.length) {
        return links;
      }

      const link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);

      return [link];
    };

    const initialHref = getLinkElements()[0]?.href ?? '';
    const current = signal(initialHref);
    const original = signal(initialHref);

    // A page can declare several icon links and the browser picks one by size or type,
    // so every match is updated. Each href is remembered on first change to keep
    // `reset()` from collapsing a multi-resolution set into a single URL.
    // The raw attribute is stored rather than `link.href`, which resolves to an
    // absolute URL and would rewrite an authored relative path on reset.
    const originalHrefs = new WeakMap<HTMLLinkElement, string | null>();

    const apply = (url: string) => {
      for (const link of getLinkElements()) {
        if (!originalHrefs.has(link)) {
          originalHrefs.set(link, link.getAttribute('href'));
        }

        link.href = url;
      }

      current.set(url);
    };

    const set = (url: string) => {
      apply(baseUrl + url);
    };

    const setEmoji = (emoji: string) => {
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return;
      }

      ctx.font = '28px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(emoji, 16, 18);

      apply(canvas.toDataURL('image/png'));
    };

    const reset = () => {
      for (const link of getLinkElements()) {
        if (!originalHrefs.has(link)) {
          continue;
        }

        const originalHref = originalHrefs.get(link);

        if (originalHref === null) {
          link.removeAttribute('href');
        } else {
          link.setAttribute('href', originalHref!);
        }
      }

      current.set(untracked(original));
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

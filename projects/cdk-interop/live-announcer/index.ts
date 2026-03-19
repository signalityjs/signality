import { inject, signal, type Signal } from '@angular/core';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { WithInjector } from '@signality/core';
import { constSignal, NOOP_FN, setupContext } from '@signality/core/internal';

/**
 * Controls how urgently a screen reader will announce a message.
 *
 * - `'polite'` — waits for the user to be idle before announcing (recommended default).
 * - `'assertive'` — announces immediately, interrupting any speech in progress.
 * - `'off'` — no announcement; `announce()` is a no-op when this level is used.
 *
 * @see [aria-live on MDN](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-live)
 * @see [AriaLivePoliteness on Angular CDK](https://material.angular.io/cdk/a11y/api#AriaLivePoliteness)
 */
export type AriaLivePoliteness = 'polite' | 'assertive' | 'off';

export interface LiveAnnouncerOptions extends WithInjector {
  /**
   * Default politeness level applied when `announce()` is called without an explicit level.
   *
   * @default 'polite'
   * @see [LiveAnnouncer on Angular CDK](https://material.angular.io/cdk/a11y/overview#liveannouncer)
   */
  readonly defaultPoliteness?: AriaLivePoliteness;
}

export interface LiveAnnouncerRef {
  /**
   * The last message successfully announced to screen readers.
   * `null` before any announcement or after `clear()` is called.
   */
  readonly lastMessage: Signal<string | null>;

  /**
   * Announce a message to screen readers via an ARIA live region.
   * No-op when `politeness` resolves to `'off'`.
   *
   * @see [LiveAnnouncer.announce() on Angular CDK](https://material.angular.io/cdk/a11y/api#LiveAnnouncer)
   */
  readonly announce: (message: string, politeness?: AriaLivePoliteness) => void;

  /**
   * Clear all pending announcements from the ARIA live region and reset `lastMessage` to `null`.
   *
   * @see [LiveAnnouncer.clear() on Angular CDK](https://material.angular.io/cdk/a11y/api#LiveAnnouncer)
   */
  readonly clear: () => void;
}

/**
 * Signal-based wrapper around the [Angular CDK LiveAnnouncer](https://material.angular.io/cdk/a11y/overview#liveannouncer).
 *
 * @param options - Optional configuration
 * @returns A LiveAnnouncerRef with announcement methods and last message signal
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     <div>
 *       <button (click)="addToCart()">Add to cart</button>
 *       <button (click)="announcer.clear()">Clear Announcements</button>
 *       @if (announcer.lastMessage(); as message) {
 *         <p>Last: {{ message }}</p>
 *       }
 *     </div>
 *   `
 * })
 * class ShoppingCart {
 *   readonly announcer = liveAnnouncer();
 *
 *   addToCart() {
 *     this.announcer.announce('Item added to cart', 'polite');
 *   }
 * }
 * ```
 */
export function liveAnnouncer(options?: LiveAnnouncerOptions): LiveAnnouncerRef {
  const { runInContext } = setupContext(options?.injector, liveAnnouncer);

  return runInContext(({ isServer }) => {
    if (isServer) {
      return {
        lastMessage: constSignal(null),
        announce: NOOP_FN,
        clear: NOOP_FN,
      };
    }

    const cdkLiveAnnouncer = inject(LiveAnnouncer);
    const defaultPoliteness = options?.defaultPoliteness ?? 'polite';

    const lastMessage = signal<string | null>(null);

    const announce = (message: string, politeness?: AriaLivePoliteness) => {
      const politenessLevel = politeness ?? defaultPoliteness;

      if (politenessLevel === 'off') {
        return;
      }

      cdkLiveAnnouncer.announce(message, politenessLevel as 'polite' | 'assertive').then(() => {
        lastMessage.set(message);
      });
    };

    const clear = () => {
      cdkLiveAnnouncer.clear();
      lastMessage.set(null);
    };

    return {
      lastMessage: lastMessage.asReadonly(),
      announce,
      clear,
    };
  });
}

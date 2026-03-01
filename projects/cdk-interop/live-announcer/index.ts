import { inject, signal, type Signal } from '@angular/core';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { constSignal, NOOP_FN, setupContext, WithInjector } from '@signality/core';

export type AriaLivePoliteness = 'polite' | 'assertive' | 'off';

export interface LiveAnnouncerOptions extends WithInjector {
  /**
   * Default politeness level for announcements.
   * @default 'polite'
   */
  readonly defaultPoliteness?: AriaLivePoliteness;
}

export interface LiveAnnouncerRef {
  /** Last announced message */
  readonly lastMessage: Signal<string | null>;

  /** Announce a message to screen readers */
  readonly announce: (message: string, politeness?: AriaLivePoliteness) => void;

  /** Clear all announcements */
  readonly clear: () => void;
}

/**
 * Signal-based wrapper around the [Angular CDK](https://material.angular.io/cdk/a11y/overview) LiveAnnouncer.
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
 * class ShoppingComponent {
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

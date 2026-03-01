import { type Signal, signal, untracked } from '@angular/core';
import { constSignal, NOOP_FN, setupContext, type Timer, toValue } from '@signality/core/internal';
import type { MaybeSignal, WithInjector } from '@signality/core/types';

export interface WebNotificationOptions extends WithInjector {
  /**
   * Auto-close notifications after specified milliseconds.
   */
  readonly autoClose?: MaybeSignal<number>;
}

export interface WebNotificationRef {
  /** Whether Notifications API is supported */
  readonly isSupported: Signal<boolean>;

  /** Current permission state */
  readonly permission: Signal<NotificationPermission>;

  /** Request notification permission */
  readonly requestPermission: () => Promise<NotificationPermission>;

  /** Show a notification */
  readonly show: (title: string, options?: NotificationOptions) => Notification | undefined;

  /** Close a notification */
  readonly close: (notification: Notification) => void;
}

/**
 * Signal-based wrapper around the Notifications API.
 *
 * @param options - Optional configuration
 * @returns A WebNotificationRef with notification control methods
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     <button (click)="requestPermission()">Request Permission</button>
 *     <button (click)="showNotification()" [disabled]="notif.permission() !== 'granted'">
 *       Show Notification
 *     </button>
 *   `
 * })
 * class NotificationComponent {
 *   readonly notif = webNotification();
 *
 *   async requestPermission() {
 *     await this.notif.requestPermission();
 *   }
 *
 *   showNotification() {
 *     this.notif.show('Hello!', { body: 'This is a notification' });
 *   }
 * }
 * ```
 */
export function webNotification(options?: WebNotificationOptions): WebNotificationRef {
  const { runInContext } = setupContext(options?.injector, webNotification);

  return runInContext(({ isBrowser, onCleanup }) => {
    const isSupported = constSignal(isBrowser && 'Notification' in window);

    if (!isSupported()) {
      return {
        isSupported,
        permission: constSignal('denied'),
        requestPermission: async () => 'denied',
        show: () => undefined,
        close: NOOP_FN,
      };
    }

    const permission = signal(Notification.permission);

    let timeouts: Set<Timer> | null = null;

    const requestPermission = async (): Promise<NotificationPermission> => {
      try {
        const result = await Notification.requestPermission();
        permission.set(result);
        return result;
      } catch (error) {
        if (ngDevMode) {
          console.warn(`[webNotification] Failed to request notification permission.`, error);
        }
        return permission();
      }
    };

    const show = (title: string, notifOptions?: NotificationOptions): Notification | undefined => {
      return untracked(() => {
        if (permission() !== 'granted') {
          return undefined;
        }

        try {
          const autoClose = toValue(options?.autoClose);
          const notification = new Notification(title, notifOptions);

          if (autoClose && autoClose > 0) {
            const timeout = setTimeout(() => {
              notification.close();
              timeouts?.delete(timeout);
            }, autoClose);

            (timeouts ??= new Set()).add(timeout);
          }

          return notification;
        } catch (error) {
          if (ngDevMode) {
            console.warn(`[webNotification] Failed to show notification.`, error);
          }
          return undefined;
        }
      });
    };

    const close = (notification: Notification) => {
      try {
        notification.close();
      } catch (error) {
        if (ngDevMode) {
          console.warn(`[webNotification] Failed to close notification.`, error);
        }
      }
    };

    onCleanup(() => {
      timeouts?.forEach(timeout => clearTimeout(timeout));
      timeouts?.clear();
    });

    return {
      isSupported,
      permission: permission.asReadonly(),
      requestPermission,
      show,
      close,
    };
  });
}

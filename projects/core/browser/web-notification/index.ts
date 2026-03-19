import { type Signal, signal, untracked } from '@angular/core';
import { constSignal, NOOP_FN, setupContext, type Timer, toValue } from '@signality/core/internal';
import type { MaybeSignal, WithInjector } from '@signality/core/types';

export interface WebNotificationOptions extends NotificationOptions, WithInjector {
  /**
   * Auto-close the notification after the specified number of milliseconds.
   *
   * @see [Notification: close() on MDN](https://developer.mozilla.org/en-US/docs/Web/API/Notification/close)
   */
  readonly autoClose?: MaybeSignal<number>;
}

export interface WebNotificationRef {
  /**
   * Whether the Notifications API is supported in the current browser.
   *
   * @see [Notifications API browser compatibility on MDN](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API#browser_compatibility)
   */
  readonly isSupported: Signal<boolean>;

  /**
   * Current notification permission state: `'granted'`, `'denied'`, or `'default'`.
   *
   * @see [Notification: permission static property on MDN](https://developer.mozilla.org/en-US/docs/Web/API/Notification/permission_static)
   */
  readonly permission: Signal<NotificationPermission>;

  /**
   * The currently active notification instance, or `null` if none is shown.
   *
   * @see [Notification on MDN](https://developer.mozilla.org/en-US/docs/Web/API/Notification)
   */
  readonly notification: Signal<Notification | null>;

  /**
   * Request permission to show notifications.
   *
   * @see [Notification: requestPermission() on MDN](https://developer.mozilla.org/en-US/docs/Web/API/Notification/requestPermission_static)
   */
  readonly requestPermission: () => Promise<NotificationPermission>;

  /**
   * Show a notification. Automatically closes the previous one. Per-call options override constructor defaults.
   *
   * @see [Notification() constructor on MDN](https://developer.mozilla.org/en-US/docs/Web/API/Notification/Notification)
   */
  readonly show: (title: string, options?: NotificationOptions) => Notification | undefined;

  /**
   * Close the currently active notification.
   *
   * @see [Notification: close() on MDN](https://developer.mozilla.org/en-US/docs/Web/API/Notification/close)
   */
  readonly close: () => void;
}

/**
 * Signal-based wrapper around the [Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API).
 *
 * Tracks the current notification as a signal. Calling `show()` auto-closes
 * the previous notification. Calling `close()` closes the current one.
 *
 * @param options - Optional configuration and default notification options
 * @returns A WebNotificationRef with notification state and control methods
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     <button (click)="requestPermission()">Request Permission</button>
 *     <button (click)="showNotification()" [disabled]="notif.permission() !== 'granted'">
 *       Show Notification
 *     </button>
 *     @if (notif.notification()) {
 *       <button (click)="notif.close()">Close</button>
 *     }
 *   `
 * })
 * export class NotificationDemo {
 *   readonly notif = webNotification({ icon: '/icon.png' });
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
        notification: constSignal(null),
        requestPermission: async () => 'denied',
        show: () => undefined,
        close: NOOP_FN,
      };
    }

    const permission = signal(Notification.permission);
    const notification = signal<Notification | null>(null);

    let autoCloseTimeout: Timer;

    const clearAutoClose = () => {
      clearTimeout(autoCloseTimeout);
      autoCloseTimeout = undefined;
    };

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

    const close = (): void => {
      clearAutoClose();

      const current = notification();

      if (current) {
        try {
          current.onclose = null;
          current.close();
        } catch (error) {
          if (ngDevMode) {
            console.warn(`[webNotification] Failed to close notification.`, error);
          }
        }
        notification.set(null);
      }
    };

    const show = (title: string, overrides?: NotificationOptions): Notification | undefined => {
      return untracked(() => {
        if (permission() !== 'granted') {
          return undefined;
        }

        close();

        try {
          const { autoClose, ...defaults } = options ?? {};
          const mergedOptions = { ...defaults, ...overrides };

          const instance = new Notification(title, mergedOptions);

          instance.onclose = () => {
            clearAutoClose();
            notification.set(null);
          };

          notification.set(instance);

          const autoCloseMs = toValue(autoClose);
          if (autoCloseMs && autoCloseMs > 0) {
            autoCloseTimeout = setTimeout(close, autoCloseMs);
          }

          return instance;
        } catch (error) {
          if (ngDevMode) {
            console.warn(`[webNotification] Failed to show notification.`, error);
          }
          return undefined;
        }
      });
    };

    onCleanup(close);

    return {
      isSupported,
      permission: permission.asReadonly(),
      notification: notification.asReadonly(),
      requestPermission,
      show,
      close,
    };
  });
}

import { type Signal, signal, untracked } from '@angular/core';
import {
  constSignal,
  NOOP_ASYNC_FN,
  NOOP_FN,
  setupContext,
  type Timer,
} from '@signality/core/internal';
import { toValue } from '@signality/core/utilities';
import type { MaybeSignal, WithInjector } from '@signality/core/types';
import { watcher } from '@signality/core/reactivity';
import { permissionState } from '@signality/core/browser/permission-state';

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
  readonly requestPermission: () => Promise<void>;

  /**
   * Show a notification.
   *
   * @see [Notification() constructor on MDN](https://developer.mozilla.org/en-US/docs/Web/API/Notification/Notification)
   */
  readonly show: (title: string, options?: NotificationOptions) => void;

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
        requestPermission: NOOP_ASYNC_FN,
        show: NOOP_FN,
        close: NOOP_FN,
      };
    }

    const permission = signal(Notification.permission);
    const notification = signal<Notification | null>(null);

    let autoCloseTimeout: Timer;

    const cancelAutoClose = () => {
      clearTimeout(autoCloseTimeout);
      autoCloseTimeout = undefined;
    };

    const requestPermission = async (): Promise<void> => {
      const result = await Notification.requestPermission();
      permission.set(result);
    };

    const close = () => {
      cancelAutoClose();

      const current = untracked(notification);

      if (current) {
        current.onclose = null;
        current.close();
        notification.set(null);
      }
    };

    const show = (title: string, overrides?: NotificationOptions) => {
      if (untracked(permission) !== 'granted') {
        return;
      }

      const { autoClose, ...defaultOptions } = options ?? {};
      const instance = new Notification(title, { ...defaultOptions, ...overrides });

      instance.onclose = () => {
        cancelAutoClose();
        notification.set(null);
      };

      notification.set(instance);

      const autoCloseMs = toValue(autoClose);
      if (autoCloseMs && autoCloseMs > 0) {
        autoCloseTimeout = setTimeout(close, autoCloseMs);
      }
    };

    onCleanup(close);

    watcher(permissionState('notifications'), state => {
      permission.set(state === 'prompt' ? 'default' : state);

      if (state === 'denied') {
        close();
      }
    });

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

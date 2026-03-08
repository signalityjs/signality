import { type Signal, signal, untracked } from '@angular/core';
import { constSignal, NOOP_FN, setupContext, type Timer, toValue } from '@signality/core/internal';
import type { MaybeSignal, WithInjector } from '@signality/core/types';

export interface WebNotificationOptions extends NotificationOptions, WithInjector {
  /**
   * Auto-close notification after specified milliseconds.
   */
  readonly autoClose?: MaybeSignal<number>;
}

export interface WebNotificationRef {
  /** Whether Notifications API is supported */
  readonly isSupported: Signal<boolean>;

  /** Current permission state */
  readonly permission: Signal<NotificationPermission>;

  /** Current active notification instance */
  readonly notification: Signal<Notification | null>;

  /** Request notification permission */
  readonly requestPermission: () => Promise<NotificationPermission>;

  /** Show a notification (auto-closes previous). Per-call options override defaults from constructor. */
  readonly show: (title: string, options?: NotificationOptions) => Notification | undefined;

  /** Close the current notification */
  readonly close: () => void;
}

/**
 * Signal-based wrapper around the Notifications API.
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
 * class NotificationComponent {
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
      if (autoCloseTimeout) {
        clearTimeout(autoCloseTimeout);
        autoCloseTimeout = undefined;
      }
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

      const current = untracked(notification);

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

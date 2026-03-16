import { type CreateSignalOptions, type Signal, signal } from '@angular/core';
import { constSignal, createToken, setupContext } from '@signality/core/internal';
import type { WithInjector } from '@signality/core/types';
import { listener, setupSync } from '@signality/core/browser/listener';

export type OnlineOptions = CreateSignalOptions<boolean> & WithInjector;

/**
 * Reactive wrapper around the [Navigator.onLine](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/onLine) property.
 *
 * @param options - Optional configuration including signal options and injector
 * @returns A signal containing the current online status (`true` for online, `false` for offline)
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     @if (isOnline()) {
 *       <p>You're online</p>
 *     } @else {
 *       <p>You're offline</p>
 *     }
 *   `
 * })
 * class NetworkStatus {
 *   readonly isOnline = online();
 * }
 * ```
 */
export function online(options?: OnlineOptions): Signal<boolean> {
  const { runInContext } = setupContext(options?.injector, online);

  return runInContext(({ isServer }) => {
    if (isServer) {
      return constSignal(true);
    }

    const isOnline = signal(navigator.onLine, options);

    const update = () => isOnline.set(navigator.onLine);

    setupSync(() => {
      listener(window, 'online', update);
      listener(window, 'offline', update);
    });

    return isOnline.asReadonly();
  });
}

export const ONLINE = /* @__PURE__ */ createToken(online);

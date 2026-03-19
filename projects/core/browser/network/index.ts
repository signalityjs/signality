import { inject, type Signal, signal } from '@angular/core';
import { constSignal, createToken, setupContext } from '@signality/core/internal';
import type { WithInjector } from '@signality/core/types';
import { listener, setupSync } from '@signality/core/browser/listener';
import { ONLINE } from '@signality/core/browser/online';

export type EffectiveConnectionType = 'slow-2g' | '2g' | '3g' | '4g';

export type ConnectionType =
  | 'bluetooth'
  | 'cellular'
  | 'ethernet'
  | 'wifi'
  | 'wimax'
  | 'none'
  | 'other'
  | 'unknown';

export type NetworkOptions = WithInjector;

export interface NetworkRef {
  /**
   * Whether the Network Information API is supported in the current browser.
   *
   * @see [Network Information API browser compatibility on MDN](https://developer.mozilla.org/en-US/docs/Web/API/Network_Information_API#browser_compatibility)
   */
  readonly isSupported: Signal<boolean>;

  /**
   * Whether the browser currently has network connectivity.
   *
   * @see [Navigator: onLine on MDN](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/onLine)
   */
  readonly isOnline: Signal<boolean>;

  /**
   * Estimated effective connection type based on recently observed network conditions.
   *
   * @see [NetworkInformation: effectiveType on MDN](https://developer.mozilla.org/en-US/docs/Web/API/NetworkInformation/effectiveType)
   */
  readonly effectiveType: Signal<EffectiveConnectionType | undefined>;

  /**
   * Estimated downlink bandwidth in Mbps.
   *
   * @see [NetworkInformation: downlink on MDN](https://developer.mozilla.org/en-US/docs/Web/API/NetworkInformation/downlink)
   */
  readonly downlink: Signal<number | undefined>;

  /**
   * Estimated round-trip latency in milliseconds.
   *
   * @see [NetworkInformation: rtt on MDN](https://developer.mozilla.org/en-US/docs/Web/API/NetworkInformation/rtt)
   */
  readonly rtt: Signal<number | undefined>;

  /**
   * Whether the user has enabled a data-saving mode in their browser or OS.
   *
   * @see [NetworkInformation: saveData on MDN](https://developer.mozilla.org/en-US/docs/Web/API/NetworkInformation/saveData)
   */
  readonly saveData: Signal<boolean>;

  /**
   * The physical connection type (e.g. `'wifi'`, `'cellular'`).
   *
   * @see [NetworkInformation: type on MDN](https://developer.mozilla.org/en-US/docs/Web/API/NetworkInformation/type)
   */
  readonly type: Signal<ConnectionType | undefined>;
}

/**
 * Signal-based wrapper around the [Network Information API](https://developer.mozilla.org/en-US/docs/Web/API/Network_Information_API) and online/offline events.
 *
 * @param options - Optional configuration including injector
 * @returns A NetworkRef with network status signals
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     <p>{{ net.isOnline() ? 'Online' : 'Offline' }}</p>
 *     @if (net.effectiveType()) {
 *       <p>Connection: {{ net.effectiveType() }}</p>
 *     }
 *   `
 * })
 * export class NetworkComponent {
 *   readonly net = network();
 * }
 * ```
 */
export function network(options?: NetworkOptions): NetworkRef {
  const { runInContext } = setupContext(options?.injector, network);

  return runInContext(({ isBrowser }) => {
    const isSupported = constSignal(isBrowser && 'connection' in navigator);

    if (!isSupported()) {
      return {
        isSupported,
        isOnline: constSignal(true),
        effectiveType: constSignal(undefined),
        downlink: constSignal(undefined),
        rtt: constSignal(undefined),
        saveData: constSignal(false),
        type: constSignal(undefined),
      };
    }

    const { connection } = navigator as NavigatorWithConnection;

    const isOnline = inject(ONLINE);
    const effectiveType = signal(connection.effectiveType);
    const downlink = signal(connection.downlink);
    const rtt = signal(connection.rtt);
    const saveData = signal(!!connection.saveData);
    const type = signal(connection.type);

    setupSync(() => {
      listener(connection, 'change', () => {
        effectiveType.set(connection.effectiveType);
        downlink.set(connection.downlink);
        rtt.set(connection.rtt);
        saveData.set(!!connection.saveData);
        type.set(connection.type);
      });
    });

    return {
      isSupported,
      isOnline,
      effectiveType: effectiveType.asReadonly(),
      downlink: downlink.asReadonly(),
      rtt: rtt.asReadonly(),
      saveData: saveData.asReadonly(),
      type: type.asReadonly(),
    };
  });
}

export const NETWORK = /* @__PURE__ */ createToken(network);

interface NetworkInformation extends EventTarget {
  readonly effectiveType?: EffectiveConnectionType;
  readonly downlink?: number;
  readonly rtt?: number;
  readonly saveData?: boolean;
  readonly type?: ConnectionType;
}

interface NavigatorWithConnection extends Navigator {
  readonly connection: NetworkInformation;
}

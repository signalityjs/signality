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

export interface NetworkRef {
  /** Whether Network Information API is supported */
  readonly isSupported: Signal<boolean>;

  /** Whether the browser is online */
  readonly isOnline: Signal<boolean>;

  /** Effective connection type */
  readonly effectiveType: Signal<EffectiveConnectionType | undefined>;

  /** Downlink speed in Mbps */
  readonly downlink: Signal<number | undefined>;

  /** Round-trip time in ms */
  readonly rtt: Signal<number | undefined>;

  /** Whether user has data saver enabled */
  readonly saveData: Signal<boolean>;

  /** Connection type (wifi, cellular, etc.) */
  readonly type: Signal<ConnectionType | undefined>;
}

/**
 * Signal-based wrapper around the Network Information API and online/offline events.
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
 * class NetworkComponent {
 *   readonly net = network();
 * }
 * ```
 */
export function network(options?: WithInjector): NetworkRef {
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

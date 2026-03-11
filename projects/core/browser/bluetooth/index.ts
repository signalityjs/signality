import { type Signal, signal, untracked } from '@angular/core';
import { constSignal, NOOP_ASYNC_FN, NOOP_FN, setupContext } from '@signality/core/internal';
import type { WithInjector } from '@signality/core/types';
import { listener, setupSync } from '@signality/core/browser/listener';

export interface BluetoothOptions extends WithInjector {
  /**
   * Accept any Bluetooth device.
   */
  readonly acceptAllDevices?: boolean;

  /**
   * Filters for device selection.
   */
  readonly filters?: BluetoothLEScanFilter[];

  /**
   * Optional services to access.
   */
  readonly optionalServices?: BluetoothServiceUUID[];
}

export interface BluetoothRef {
  /** Whether Web Bluetooth API is supported */
  readonly isSupported: Signal<boolean>;

  /** Whether a device is currently connected */
  readonly isConnected: Signal<boolean>;

  /** Whether connection is in progress */
  readonly isConnecting: Signal<boolean>;

  /** Connected Bluetooth device */
  readonly device: Signal<BluetoothDevice | null>;

  /** GATT server of connected device */
  readonly server: Signal<BluetoothRemoteGATTServer | null>;

  /** Last error that occurred */
  readonly error: Signal<Error | null>;

  /** Request device connection */
  readonly request: (options?: RequestDeviceOptions) => Promise<void>;

  /** Disconnect from device */
  readonly disconnect: () => void;
}

/**
 * Signal-based wrapper around the [Web Bluetooth API](https://developer.mozilla.org/en-US/docs/Web/API/Bluetooth).
 *
 * @param options - Optional configuration
 * @returns A BluetoothRef with connection state and control methods
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     <button (click)="bt.request()">Connect</button>
 *     @if (bt.isConnected()) {
 *       <p>{{ bt.device()?.name }}</p>
 *     }
 *   `
 * })
 * class BluetoothComponent {
 *   readonly bt = bluetooth();
 * }
 * ```
 */
export function bluetooth(options?: BluetoothOptions): BluetoothRef {
  const { runInContext } = setupContext(options?.injector, bluetooth);

  return runInContext(({ isBrowser, injector, onCleanup }) => {
    const isSupported = constSignal(isBrowser && 'bluetooth' in navigator);

    if (!isSupported()) {
      return {
        isSupported,
        isConnected: constSignal(false),
        isConnecting: constSignal(false),
        device: constSignal(null),
        server: constSignal(null),
        error: constSignal(null),
        request: NOOP_ASYNC_FN,
        disconnect: NOOP_FN,
      };
    }

    const { bluetooth } = navigator;

    const isConnected = signal(false);
    const isConnecting = signal(false);
    const device = signal<BluetoothDevice | null>(null);
    const server = signal<BluetoothRemoteGATTServer | null>(null);
    const error = signal<Error | null>(null);

    const request = async (requestOptions?: RequestDeviceOptions): Promise<void> => {
      if (untracked(isConnecting)) {
        return;
      }

      isConnecting.set(true);
      error.set(null);

      try {
        const requestOpts: RequestDeviceOptions = requestOptions ?? {
          acceptAllDevices: options?.acceptAllDevices ?? true,
          optionalServices: options?.optionalServices ?? [],
          ...(options?.filters ? { filters: options.filters, acceptAllDevices: false } : {}),
        };

        const btDevice = await bluetooth.requestDevice(requestOpts);

        device.set(btDevice);

        setupSync(() => {
          listener(
            btDevice,
            'gattserverdisconnected',
            () => {
              isConnected.set(false);
              server.set(null);
            },
            { injector }
          );
        });

        const gattServer = await btDevice.gatt?.connect();

        if (gattServer) {
          server.set(gattServer);
          isConnected.set(true);
        }
      } catch (e) {
        error.set(e as Error);
        device.set(null);
        server.set(null);
        isConnected.set(false);
      } finally {
        isConnecting.set(false);
      }
    };

    const disconnect = () => {
      const currentDevice = untracked(device);

      if (currentDevice?.gatt?.connected) {
        currentDevice.gatt.disconnect();
      }

      device.set(null);
      server.set(null);
      isConnected.set(false);
    };

    onCleanup(disconnect);

    return {
      isSupported,
      isConnected: isConnected.asReadonly(),
      isConnecting: isConnecting.asReadonly(),
      device: device.asReadonly(),
      server: server.asReadonly(),
      error: error.asReadonly(),
      request,
      disconnect,
    };
  });
}

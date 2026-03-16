import { type Signal, signal, untracked } from '@angular/core';
import { constSignal, NOOP_ASYNC_FN, NOOP_FN, setupContext } from '@signality/core/internal';
import type { WithInjector } from '@signality/core/types';
import { listener, ListenerRef, setupSync } from '@signality/core/browser/listener';

export interface BluetoothOptions extends WithInjector {
  /**
   * Accept any Bluetooth device without filtering.
   *
   * @see [requestDevice: acceptAllDevices on MDN](https://developer.mozilla.org/en-US/docs/Web/API/Bluetooth/requestDevice#acceptalldevices)
   */
  readonly acceptAllDevices?: boolean;

  /**
   * Filters for device selection. Mutually exclusive with `acceptAllDevices`.
   *
   * @see [requestDevice: filters on MDN](https://developer.mozilla.org/en-US/docs/Web/API/Bluetooth/requestDevice#filters)
   */
  readonly filters?: BluetoothLEScanFilter[];

  /**
   * Optional GATT services to access on the connected device.
   *
   * @see [requestDevice: optionalServices on MDN](https://developer.mozilla.org/en-US/docs/Web/API/Bluetooth/requestDevice#optionalservices)
   */
  readonly optionalServices?: BluetoothServiceUUID[];
}

export interface BluetoothRef {
  /**
   * Whether Web Bluetooth API is supported in the current browser.
   *
   * @see [Web Bluetooth API browser compatibility on MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API#browser_compatibility)
   */
  readonly isSupported: Signal<boolean>;

  /**
   * Whether a device is currently connected.
   */
  readonly isConnected: Signal<boolean>;

  /**
   * Whether a connection is in progress.
   */
  readonly isConnecting: Signal<boolean>;

  /**
   * Connected Bluetooth device.
   */
  readonly device: Signal<BluetoothDevice | null>;

  /**
   * GATT server of a connected device.
   */
  readonly server: Signal<BluetoothRemoteGATTServer | null>;

  /**
   * The last error that occurred.
   */
  readonly error: Signal<Error | null>;

  /**
   * Request device connection.
   */
  readonly request: () => Promise<void>;

  /**
   * Disconnect from a device.
   */
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
 * class BluetoothDemo {
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

    const requestOptions = {
      ...(options?.filters?.length
        ? { filters: options.filters }
        : { acceptAllDevices: options?.acceptAllDevices ?? true }),
      optionalServices: options?.optionalServices ?? [],
    };

    const isConnected = signal(false);
    const isConnecting = signal(false);
    const device = signal<BluetoothDevice | null>(null);
    const server = signal<BluetoothRemoteGATTServer | null>(null);
    const error = signal<Error | null>(null);

    let disconnectListener: ListenerRef | null = null;

    const disconnect = () => {
      if (disconnectListener) {
        disconnectListener?.destroy();
        disconnectListener = null;
      }

      const activeDevice = untracked(device);

      if (activeDevice?.gatt?.connected) {
        activeDevice.gatt.disconnect();
      }

      device.set(null);
      server.set(null);
      isConnected.set(false);
    };

    const request = async (): Promise<void> => {
      if (untracked(isConnecting)) {
        return;
      }

      if (untracked(isConnected)) {
        disconnect();
      }

      isConnecting.set(true);
      error.set(null);

      try {
        const btDevice = await navigator.bluetooth.requestDevice(requestOptions);

        device.set(btDevice);

        disconnectListener = setupSync(() =>
          listener(btDevice, 'gattserverdisconnected', disconnect, { injector })
        );

        const gattServer = await btDevice.gatt?.connect();

        if (gattServer) {
          server.set(gattServer);
          isConnected.set(true);
        }
      } catch (e) {
        error.set(e as Error);
        disconnect();
      } finally {
        isConnecting.set(false);
      }
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

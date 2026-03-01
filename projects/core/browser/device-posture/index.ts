import { type Signal, signal } from '@angular/core';
import { constSignal, setupContext } from '@signality/core/internal';
import type { WithInjector } from '@signality/core/types';
import { listener, setupSync } from '@signality/core/browser/listener';

export type DevicePostureType = 'continuous' | 'folded';

export interface DevicePostureRef {
  /** Whether Device Posture API is supported */
  readonly isSupported: Signal<boolean>;

  /** Current device posture */
  readonly type: Signal<DevicePostureType>;
}

/**
 * Signal-based wrapper around the [Device Posture API](https://developer.mozilla.org/en-US/docs/Web/API/Device_Posture_API).
 * Track device posture state for foldable devices.
 *
 * @param options - Optional configuration including injector
 * @returns A DevicePostureRef with type signal
 *
 */
export function devicePosture(options?: WithInjector): DevicePostureRef {
  const { runInContext } = setupContext(options?.injector, devicePosture);

  return runInContext(({ isBrowser }) => {
    const isSupported = constSignal(
      isBrowser && 'devicePosture' in navigator && !!navigator.devicePosture
    );

    if (!isSupported()) {
      return {
        isSupported,
        type: constSignal('continuous'),
      };
    }

    const { devicePosture } = navigator as NavigatorWithDevicePosture;

    const type = signal<DevicePostureType>(devicePosture.type);

    setupSync(() => {
      listener(devicePosture, 'change', () => type.set(devicePosture.type));
    });

    return {
      isSupported,
      type: type.asReadonly(),
    };
  });
}

interface DevicePosture extends EventTarget {
  readonly type: DevicePostureType;
}

interface NavigatorWithDevicePosture extends Navigator {
  readonly devicePosture: DevicePosture;
}

import { type Signal, signal } from '@angular/core';
import { constSignal, setupContext } from '@signality/core/internal';
import type { WithInjector } from '@signality/core/types';
import { listener, setupSync } from '@signality/core/browser/listener';

export type BatteryOptions = WithInjector;

export interface BatteryRef {
  readonly charging: Signal<boolean>;
  readonly chargingTime: Signal<number>;
  readonly dischargingTime: Signal<number>;
  readonly level: Signal<number>;
  readonly isSupported: Signal<boolean>;
}

/**
 * Signal-based wrapper around the [Battery Status API](https://developer.mozilla.org/en-US/docs/Web/API/Battery_Status_API).
 *
 * @param options - Optional configuration with injector
 * @returns A BatteryRef with battery status signals
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     @if (batteryStatus.isSupported()) {
 *       <div>
 *         <p>Charging: {{ batteryStatus.charging() }}</p>
 *         <p>Level: {{ batteryStatus.level() * 100 }}%</p>
 *       </div>
 *     }
 *   `
 * })
 * class BatteryComponent {
 *   readonly batteryStatus = battery();
 * }
 * ```
 */
export function battery(options?: BatteryOptions): BatteryRef {
  const { runInContext } = setupContext(options?.injector, battery);

  return runInContext(({ isBrowser, injector }) => {
    const isSupported = constSignal(
      isBrowser && 'getBattery' in navigator && typeof navigator.getBattery === 'function'
    );

    if (!isSupported()) {
      return {
        isSupported,
        charging: constSignal(false),
        chargingTime: constSignal(0),
        dischargingTime: constSignal(0),
        level: constSignal(1),
      };
    }

    const charging = signal(false);
    const chargingTime = signal(0);
    const dischargingTime = signal(0);
    const level = signal(1);

    function update(this: BatteryManager) {
      charging.set(this.charging);
      chargingTime.set(this.chargingTime);
      dischargingTime.set(this.dischargingTime);
      level.set(this.level);
    }

    (navigator as NavigatorWithBattery).getBattery().then(battery => {
      update.call(battery);

      setupSync(() => {
        for (const event of BATTERY_EVENTS) {
          listener.passive(battery, event, update, { injector });
        }
      });
    });

    return {
      isSupported,
      charging: charging.asReadonly(),
      chargingTime: chargingTime.asReadonly(),
      dischargingTime: dischargingTime.asReadonly(),
      level: level.asReadonly(),
    };
  });
}

interface NavigatorWithBattery extends Navigator {
  readonly getBattery: () => Promise<BatteryManager>;
}

interface BatteryManager extends EventTarget {
  readonly charging: boolean;
  readonly chargingTime: number;
  readonly dischargingTime: number;
  readonly level: number;
}

const BATTERY_EVENTS = [
  'chargingchange',
  'chargingtimechange',
  'dischargingtimechange',
  'levelchange',
] as const;

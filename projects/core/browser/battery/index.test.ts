import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { battery } from './index';

describe(battery.name, () => {
  let mockBattery: {
    charging: boolean;
    chargingTime: number;
    dischargingTime: number;
    level: number;
    addEventListener: jest.Mock;
    removeEventListener: jest.Mock;
  };

  beforeEach(() => {
    mockBattery = {
      charging: false,
      chargingTime: 0,
      dischargingTime: Infinity,
      level: 1,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };

    (navigator as any).getBattery = jest.fn().mockResolvedValue(mockBattery);
  });

  @Component({ template: '{{ batteryStatus.charging() }}' })
  class TestComponent {
    readonly batteryStatus = battery();
  }

  const createComponent = async () => {
    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    // wait for getBattery promise to resolve
    await Promise.resolve();
    fixture.detectChanges();

    return fixture.componentInstance;
  };

  const triggerBatteryEvent = (
    eventType: 'chargingchange' | 'levelchange' | 'chargingtimechange' | 'dischargingtimechange'
  ) => {
    const listeners = mockBattery.addEventListener.mock.calls
      .filter(([event]) => event === eventType)
      .map(([, callback]) => callback);

    listeners.forEach(cb => cb.call(mockBattery, new Event(eventType)));
  };

  it('should return initial battery status', async () => {
    const component = await createComponent();

    expect(component.batteryStatus.charging()).toBe(mockBattery.charging);
    expect(component.batteryStatus.chargingTime()).toBe(mockBattery.chargingTime);
    expect(component.batteryStatus.dischargingTime()).toBe(mockBattery.dischargingTime);
    expect(component.batteryStatus.level()).toBe(mockBattery.level);
  });

  it('should update when battery events fire', async () => {
    const component = await createComponent();

    mockBattery.charging = true;
    mockBattery.chargingTime = 1800;
    triggerBatteryEvent('chargingchange');
    expect(component.batteryStatus.charging()).toBe(true);
    expect(component.batteryStatus.chargingTime()).toBe(1800);

    mockBattery.level = 0.5;
    triggerBatteryEvent('levelchange');
    expect(component.batteryStatus.level()).toBe(0.5);

    mockBattery.chargingTime = 3600;
    triggerBatteryEvent('chargingtimechange');
    expect(component.batteryStatus.chargingTime()).toBe(3600);

    mockBattery.dischargingTime = 7200;
    triggerBatteryEvent('dischargingtimechange');
    expect(component.batteryStatus.dischargingTime()).toBe(7200);

    mockBattery.charging = false;
    mockBattery.level = 0.25;
    triggerBatteryEvent('chargingchange');
    triggerBatteryEvent('levelchange');
    expect(component.batteryStatus.charging()).toBe(false);
    expect(component.batteryStatus.level()).toBe(0.25);
  });
});

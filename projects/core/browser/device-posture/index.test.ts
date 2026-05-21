import { vi, type Mock } from 'vitest';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { devicePosture } from './index';

describe(devicePosture.name, () => {
  let mockDevicePosture: {
    type: 'continuous' | 'folded';
    addEventListener: Mock;
    removeEventListener: Mock;
  };

  beforeEach(() => {
    mockDevicePosture = {
      type: 'continuous',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };

    (navigator as any).devicePosture = mockDevicePosture;
  });

  @Component({ template: '' })
  class TestComponent {
    readonly posture = devicePosture();
  }

  const createComponent = () => {
    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    return fixture.componentInstance;
  };

  const triggerChange = () => {
    const changeEvent = new Event('change');
    const listeners = mockDevicePosture.addEventListener.mock.calls
      .filter(([event]) => event === 'change')
      .map(([, callback]) => callback);

    listeners.forEach(cb => cb(changeEvent));
  };

  it('should return current device posture type', () => {
    const component = createComponent();

    expect(component.posture.type()).toBe(mockDevicePosture.type);
  });

  it('should update when device posture changes', () => {
    const component = createComponent();

    expect(component.posture.type()).toBe(mockDevicePosture.type);

    mockDevicePosture.type = 'folded';
    triggerChange();
    expect(component.posture.type()).toBe('folded');

    mockDevicePosture.type = 'continuous';
    triggerChange();
    expect(component.posture.type()).toBe('continuous');
  });
});

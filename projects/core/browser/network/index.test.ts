import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { network } from './index';

describe(network.name, () => {
  let mockConnection: {
    effectiveType: any;
    downlink: any;
    rtt: any;
    saveData: any;
    type: any;
    addEventListener: jest.Mock;
    removeEventListener: jest.Mock;
  };

  beforeEach(() => {
    mockConnection = {
      effectiveType: '4g',
      downlink: 10,
      rtt: 50,
      saveData: false,
      type: 'wifi',
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };

    Object.defineProperty(navigator, 'connection', {
      writable: true,
      configurable: true,
      value: mockConnection,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  @Component({ template: '' })
  class TestComponent {
    readonly net = network();
  }

  const createComponent = () => {
    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    return fixture.componentInstance;
  };

  const triggerChange = () => {
    const changeEvent = new Event('change');
    const listeners = mockConnection.addEventListener.mock.calls
      .filter(([event]) => event === 'change')
      .map(([, callback]) => callback);
    listeners.forEach(listener => listener(changeEvent));
  };

  it('should return current network information', () => {
    const component = createComponent();

    expect(component.net.isSupported()).toBe(true);
    expect(component.net.effectiveType()).toBe('4g');
    expect(component.net.downlink()).toBe(10);
    expect(component.net.rtt()).toBe(50);
    expect(component.net.saveData()).toBe(false);
    expect(component.net.type()).toBe('wifi');
  });

  it('should update when connection changes', () => {
    const component = createComponent();

    mockConnection.effectiveType = '3g';
    mockConnection.downlink = 2;
    mockConnection.rtt = 200;
    mockConnection.saveData = true;
    mockConnection.type = 'cellular';
    triggerChange();

    expect(component.net.effectiveType()).toBe('3g');
    expect(component.net.downlink()).toBe(2);
    expect(component.net.rtt()).toBe(200);
    expect(component.net.saveData()).toBe(true);
    expect(component.net.type()).toBe('cellular');
  });
});

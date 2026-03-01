import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { bluetooth } from './index';

describe(bluetooth.name, () => {
  let mockGattServer: {
    connected: boolean;
    connect: jest.Mock;
    disconnect: jest.Mock;
  };

  let mockDevice: {
    name: string;
    gatt: typeof mockGattServer;
    addEventListener: jest.Mock;
    removeEventListener: jest.Mock;
  };

  beforeEach(() => {
    mockGattServer = {
      connected: true,
      connect: jest.fn().mockResolvedValue(undefined),
      disconnect: jest.fn(),
    };

    // connect returns the server itself
    mockGattServer.connect.mockResolvedValue(mockGattServer);

    mockDevice = {
      name: 'Test Device',
      gatt: mockGattServer,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };

    (navigator as any).bluetooth = {
      requestDevice: jest.fn().mockResolvedValue(mockDevice),
    };
  });

  @Component({ template: '{{ bt.isConnected() }}' })
  class TestComponent {
    readonly bt = bluetooth();
  }

  const createComponent = () => {
    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    return fixture.componentInstance;
  };

  it('should have correct initial state before request', () => {
    const component = createComponent();

    expect(component.bt.isSupported()).toBe(true);
    expect(component.bt.isConnected()).toBe(false);
    expect(component.bt.isConnecting()).toBe(false);
    expect(component.bt.device()).toBeNull();
    expect(component.bt.server()).toBeNull();
    expect(component.bt.error()).toBeNull();
  });

  it('should connect to a device on request', async () => {
    const component = createComponent();

    await component.bt.request();

    expect(navigator.bluetooth.requestDevice).toHaveBeenCalled();
    expect(component.bt.device()).toBe(mockDevice);
    expect(component.bt.server()).toBe(mockGattServer);
    expect(component.bt.isConnected()).toBe(true);
    expect(component.bt.isConnecting()).toBe(false);
    expect(component.bt.error()).toBeNull();
  });

  it('should set error on failed request', async () => {
    const err = new Error('User cancelled');
    (navigator.bluetooth.requestDevice as jest.Mock).mockRejectedValue(err);

    const component = createComponent();

    await component.bt.request();

    expect(component.bt.error()).toBe(err);
    expect(component.bt.device()).toBeNull();
    expect(component.bt.server()).toBeNull();
    expect(component.bt.isConnected()).toBe(false);
    expect(component.bt.isConnecting()).toBe(false);
  });

  it('should disconnect from device', async () => {
    const component = createComponent();

    await component.bt.request();
    component.bt.disconnect();

    expect(mockGattServer.disconnect).toHaveBeenCalled();
    expect(component.bt.device()).toBeNull();
    expect(component.bt.server()).toBeNull();
    expect(component.bt.isConnected()).toBe(false);
  });

  it('should update state on gattserverdisconnected event', async () => {
    const component = createComponent();

    await component.bt.request();

    const disconnectHandler = mockDevice.addEventListener.mock.calls
      .find(([event]) => event === 'gattserverdisconnected')?.[1];

    expect(disconnectHandler).toBeDefined();

    disconnectHandler(new Event('gattserverdisconnected'));

    expect(component.bt.isConnected()).toBe(false);
    expect(component.bt.server()).toBeNull();
  });

  it('should ignore duplicate request while connecting', async () => {
    let resolveRequest!: (value: any) => void;
    (navigator.bluetooth.requestDevice as jest.Mock).mockReturnValue(
      new Promise(resolve => (resolveRequest = resolve))
    );

    const component = createComponent();

    const firstRequest = component.bt.request();
    const secondRequest = component.bt.request();

    resolveRequest(mockDevice);
    await firstRequest;
    await secondRequest;

    expect(navigator.bluetooth.requestDevice).toHaveBeenCalledTimes(1);
  });
});

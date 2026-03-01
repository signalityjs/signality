import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { geolocation } from './index';

describe(geolocation.name, () => {
  let watchCallbacks: {
    success: PositionCallback;
    error: PositionErrorCallback;
  };

  beforeEach(() => {
    watchCallbacks = {} as typeof watchCallbacks;

    (navigator as any).geolocation = {
      watchPosition: jest.fn((success: PositionCallback, error: PositionErrorCallback) => {
        watchCallbacks.success = success;
        watchCallbacks.error = error;
        return 1;
      }),
      clearWatch: jest.fn(),
    };
  });

  const mockPosition = (lat: number, lng: number): GeolocationPosition =>
    ({
      coords: {
        latitude: lat,
        longitude: lng,
        accuracy: 10,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
      },
      timestamp: Date.now(),
    }) as GeolocationPosition;

  const mockError = (code: number, message: string): GeolocationPositionError =>
    ({ code, message, PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 }) as GeolocationPositionError;

  @Component({ template: '{{ geo.coords()?.latitude }}' })
  class TestComponent {
    readonly geo = geolocation();
  }

  const createComponent = () => {
    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    return fixture.componentInstance;
  };

  it('should start watching immediately by default', () => {
    const component = createComponent();

    expect(component.geo.isSupported()).toBe(true);
    expect(component.geo.isLoading()).toBe(true);
    expect(navigator.geolocation.watchPosition).toHaveBeenCalled();
  });

  it('should update coords on position success', () => {
    const component = createComponent();
    const pos = mockPosition(48.8566, 2.3522);

    watchCallbacks.success(pos);

    expect(component.geo.coords()?.latitude).toBe(48.8566);
    expect(component.geo.coords()?.longitude).toBe(2.3522);
    expect(component.geo.position()).toBe(pos);
    expect(component.geo.error()).toBeNull();
    expect(component.geo.isLoading()).toBe(false);
  });

  it('should set error on position failure', () => {
    const component = createComponent();
    const err = mockError(1, 'Permission denied');

    watchCallbacks.error(err);

    expect(component.geo.error()).toBe(err);
    expect(component.geo.isLoading()).toBe(false);
  });

  it('should pause and resume watching', () => {
    const component = createComponent();

    component.geo.pause();
    expect(navigator.geolocation.clearWatch).toHaveBeenCalledWith(1);
    expect(component.geo.isLoading()).toBe(false);

    component.geo.resume();
    expect(navigator.geolocation.watchPosition).toHaveBeenCalledTimes(2);
    expect(component.geo.isLoading()).toBe(true);
  });
});

import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { online } from './index';

describe(online.name, () => {
  let onlineSpy: jest.SpyInstance;

  beforeEach(() => {
    onlineSpy = jest.spyOn(navigator, 'onLine', 'get');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  @Component({ template: '{{ isOnline() }}' })
  class TestComponent {
    readonly isOnline = online();
  }

  const createComponent = () => {
    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    return fixture.componentInstance;
  };

  const setOnline = (value: boolean) => {
    onlineSpy.mockReturnValue(value);
    window.dispatchEvent(new Event(value ? 'online' : 'offline'));
  };

  it('should return current navigator onLine state', () => {
    const component = createComponent();

    expect(component.isOnline()).toBe(navigator.onLine);
  });

  it('should update when online/offline events fire', () => {
    const component = createComponent();

    setOnline(false);
    expect(component.isOnline()).toBe(false);

    setOnline(true);
    expect(component.isOnline()).toBe(true);

    setOnline(false);
    expect(component.isOnline()).toBe(false);
  });
});

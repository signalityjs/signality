import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { screenOrientation } from './index';

describe(screenOrientation.name, () => {
  // we need mock because: https://github.com/jsdom/jsdom/issues/4007
  let mockScreenOrientation: {
    type: OrientationType;
    addEventListener: jest.Mock;
    removeEventListener: jest.Mock;
  };

  beforeEach(() => {
    mockScreenOrientation = {
      type: 'portrait-primary' as OrientationType,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };

    Object.defineProperty(window.screen, 'orientation', {
      writable: true,
      configurable: true,
      value: mockScreenOrientation,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  @Component({ template: '{{ orientation() }}' })
  class TestComponent {
    readonly orientation = screenOrientation();
  }

  const createComponent = () => {
    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    return fixture.componentInstance;
  };

  const setOrientation = (value: OrientationType) => {
    mockScreenOrientation.type = value;
    const changeEvent = new Event('change');
    const listeners = mockScreenOrientation.addEventListener.mock.calls
      .filter(([event]) => event === 'change')
      .map(([, callback]) => callback);

    listeners.forEach(listener => listener(changeEvent));
  };

  it('should return current screen orientation type', () => {
    const component = createComponent();

    expect(component.orientation()).toBe('portrait-primary');
  });

  it('should update when orientation change event fires', () => {
    const component = createComponent();

    setOrientation('landscape-primary');
    expect(component.orientation()).toBe('landscape-primary');

    setOrientation('portrait-secondary');
    expect(component.orientation()).toBe('portrait-secondary');

    setOrientation('landscape-secondary');
    expect(component.orientation()).toBe('landscape-secondary');

    setOrientation('portrait-primary');
    expect(component.orientation()).toBe('portrait-primary');
  });
});

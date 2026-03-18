import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { windowFocus } from './index';

describe(windowFocus.name, () => {
  let hasFocusSpy: jest.SpyInstance;

  beforeEach(() => {
    hasFocusSpy = jest.spyOn(document, 'hasFocus');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  @Component({ template: '{{ isFocused() }}' })
  class TestComponent {
    readonly isFocused = windowFocus();
  }

  const createComponent = () => {
    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    return fixture.componentInstance;
  };

  const setFocus = (value: boolean) => {
    hasFocusSpy.mockReturnValue(value);
    window.dispatchEvent(new Event(value ? 'focus' : 'blur'));
  };

  it('should return current document hasFocus state', () => {
    const component = createComponent();

    expect(component.isFocused()).toBe(document.hasFocus());
  });

  it('should update when focus/blur events fire', () => {
    const component = createComponent();

    setFocus(false);
    expect(component.isFocused()).toBe(false);

    setFocus(true);
    expect(component.isFocused()).toBe(true);

    setFocus(false);
    expect(component.isFocused()).toBe(false);
  });
});

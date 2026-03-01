import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { pageVisibility } from './index';

describe(pageVisibility.name, () => {
  let visibilityStateSpy: jest.SpyInstance;

  beforeEach(() => {
    visibilityStateSpy = jest.spyOn(document, 'visibilityState', 'get');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  @Component({ template: '{{ visibility() }}' })
  class TestComponent {
    readonly visibility = pageVisibility();
  }

  const createComponent = () => {
    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    return fixture.componentInstance;
  };

  const setVisibility = (value: DocumentVisibilityState) => {
    visibilityStateSpy.mockReturnValue(value);
    document.dispatchEvent(new Event('visibilitychange'));
  };

  it('should return current document visibilityState', () => {
    const component = createComponent();

    expect(component.visibility()).toBe(document.visibilityState);
  });

  it('should update when visibilitychange event fires', () => {
    const component = createComponent();

    setVisibility('hidden');
    expect(component.visibility()).toBe('hidden');

    setVisibility('visible');
    expect(component.visibility()).toBe('visible');

    setVisibility('hidden');
    expect(component.visibility()).toBe('hidden');
  });
});

import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { mediaQuery } from './index';

describe(mediaQuery.name, () => {
  let listeners: Map<string, Set<(e: MediaQueryListEvent) => void>>;
  let mediaQueryState: Map<string, boolean>;

  beforeEach(() => {
    listeners = new Map();
    mediaQueryState = new Map();

    window.matchMedia = jest.fn((query: string) => {
      if (!listeners.has(query)) {
        listeners.set(query, new Set());
      }

      return {
        matches: mediaQueryState.get(query) ?? false,
        media: query,
        addEventListener: jest.fn((event: string, handler: (e: MediaQueryListEvent) => void) => {
          if (event === 'change') listeners.get(query)!.add(handler);
        }),
        removeEventListener: jest.fn((event: string, handler: (e: MediaQueryListEvent) => void) => {
          if (event === 'change') listeners.get(query)!.delete(handler);
        }),
        dispatchEvent: jest.fn(),
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
      } as unknown as MediaQueryList;
    });
  });

  const triggerChange = (query: string, matches: boolean) => {
    mediaQueryState.set(query, matches);
    listeners
      .get(query)
      ?.forEach(handler => handler({ matches, media: query } as MediaQueryListEvent));
  };

  @Component({ template: '{{ matches() }}' })
  class TestComponent {
    readonly query = signal('(min-width: 768px)');
    readonly matches = mediaQuery(this.query);
  }

  const createComponent = () => {
    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    return { fixture, component: fixture.componentInstance };
  };

  it('should return current match state', () => {
    mediaQueryState.set('(min-width: 768px)', true);

    const { component } = createComponent();

    expect(component.matches()).toBe(true);
  });

  it('should update when media query changes', () => {
    const { component } = createComponent();

    expect(component.matches()).toBe(false);

    triggerChange('(min-width: 768px)', true);
    expect(component.matches()).toBe(true);

    triggerChange('(min-width: 768px)', false);
    expect(component.matches()).toBe(false);
  });

  it('should react to signal-based query change', () => {
    const { fixture, component } = createComponent();

    expect(component.matches()).toBe(false);

    mediaQueryState.set('(prefers-color-scheme: dark)', true);
    component.query.set('(prefers-color-scheme: dark)');
    fixture.detectChanges();

    expect(component.matches()).toBe(true);
  });
});

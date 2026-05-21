import { vi } from 'vitest';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { breakpoints } from './index';

describe(breakpoints.name, () => {
  let listeners: Map<string, Set<(e: MediaQueryListEvent) => void>>;
  let mediaQueryState: Map<string, boolean>;

  beforeEach(() => {
    listeners = new Map();
    mediaQueryState = new Map();

    window.matchMedia = vi.fn((query: string) => {
      if (!listeners.has(query)) {
        listeners.set(query, new Set());
      }

      return {
        matches: mediaQueryState.get(query) ?? false,
        media: query,
        addEventListener: vi.fn((event: string, handler: (e: MediaQueryListEvent) => void) => {
          if (event === 'change') listeners.get(query)!.add(handler);
        }),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
      } as unknown as MediaQueryList;
    });
  });

  const triggerChange = (query: string, matches: boolean) => {
    mediaQueryState.set(query, matches);
    listeners
      .get(query)
      ?.forEach(handler => handler({ matches, media: query } as MediaQueryListEvent));
  };

  const BP = {
    mobile: '(max-width: 767px)',
    tablet: '(min-width: 768px) and (max-width: 1023px)',
    desktop: '(min-width: 1024px)',
  };

  @Component({ template: '{{ bp.current() }}' })
  class TestComponent {
    readonly bp = breakpoints(BP);
  }

  const createComponent = () => {
    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    return fixture.componentInstance;
  };

  it('should create a signal for each breakpoint', () => {
    const component = createComponent();

    expect(component.bp.mobile()).toBe(false);
    expect(component.bp.tablet()).toBe(false);
    expect(component.bp.desktop()).toBe(false);
    expect(component.bp.current()).toEqual([]);
  });

  it('should reflect matching breakpoints', () => {
    mediaQueryState.set(BP.mobile, true);

    const component = createComponent();

    expect(component.bp.mobile()).toBe(true);
    expect(component.bp.desktop()).toBe(false);
    expect(component.bp.current()).toEqual(['mobile']);
  });

  it('should update when breakpoints change', () => {
    const component = createComponent();

    triggerChange(BP.desktop, true);
    expect(component.bp.desktop()).toBe(true);
    expect(component.bp.current()).toEqual(['desktop']);

    triggerChange(BP.desktop, false);
    triggerChange(BP.mobile, true);
    expect(component.bp.mobile()).toBe(true);
    expect(component.bp.desktop()).toBe(false);
    expect(component.bp.current()).toEqual(['mobile']);
  });
});

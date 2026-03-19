import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { windowSize } from './index';

describe(windowSize.name, () => {
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

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const setDimensions = (innerW: number, innerH: number, clientW: number, clientH: number) => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: innerW,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: innerH,
    });
    Object.defineProperty(document.documentElement, 'clientWidth', {
      writable: true,
      configurable: true,
      value: clientW,
    });
    Object.defineProperty(document.documentElement, 'clientHeight', {
      writable: true,
      configurable: true,
      value: clientH,
    });
  };

  const triggerOrientationChange = (matches: boolean) => {
    const query = '(orientation: portrait)';
    mediaQueryState.set(query, matches);
    listeners
      .get(query)
      ?.forEach(handler => handler({ matches, media: query } as MediaQueryListEvent));
  };

  @Component({ template: '' })
  class TestComponent {
    readonly size = windowSize();
  }

  @Component({ template: '' })
  class TestWithScrollbar {
    readonly size = windowSize({ includeScrollbar: true });
  }

  @Component({ template: '' })
  class TestWithInitialValue {
    readonly size = windowSize({ initialValue: { width: 1920, height: 1080 } });
  }

  function createComponent(): TestComponent;
  function createComponent<T>(component: new (...args: any[]) => T): T;
  function createComponent<T>(component: new (...args: any[]) => T = TestComponent as any) {
    const fixture = TestBed.createComponent(component);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  it('should return default initial value before render', () => {
    setDimensions(1024, 768, 1000, 750);

    const fixture = TestBed.createComponent(TestComponent);

    expect(fixture.componentInstance.size()).toEqual({ width: 0, height: 0 });
  });

  it('should measure window dimensions after render', () => {
    setDimensions(1024, 768, 1000, 750);

    const component = createComponent();

    expect(component.size()).toEqual({ width: 1000, height: 750 });
  });

  it('should update on window resize event', () => {
    setDimensions(1024, 768, 1000, 750);

    const component = createComponent();

    setDimensions(800, 600, 780, 580);
    window.dispatchEvent(new Event('resize'));

    expect(component.size()).toEqual({ width: 780, height: 580 });
  });

  it('should update on orientation change', () => {
    setDimensions(1024, 768, 1000, 750);

    const component = createComponent();

    setDimensions(768, 1024, 750, 1000);
    triggerOrientationChange(true);
    TestBed.flushEffects();

    expect(component.size()).toEqual({ width: 750, height: 1000 });
  });

  it('should use clientWidth/clientHeight by default (without scrollbar)', () => {
    setDimensions(1024, 768, 1000, 750);

    const component = createComponent();

    expect(component.size()).toEqual({ width: 1000, height: 750 });
  });

  it('should use innerWidth/innerHeight when includeScrollbar is true', () => {
    setDimensions(1024, 768, 1000, 750);

    const component = createComponent(TestWithScrollbar);

    expect(component.size()).toEqual({ width: 1024, height: 768 });
  });

  it('should accept custom initialValue', () => {
    const fixture = TestBed.createComponent(TestWithInitialValue);

    expect(fixture.componentInstance.size()).toEqual({ width: 1920, height: 1080 });
  });

  it('should handle multiple resize events', () => {
    setDimensions(1024, 768, 1000, 750);

    const component = createComponent();

    setDimensions(800, 600, 780, 580);
    window.dispatchEvent(new Event('resize'));
    expect(component.size()).toEqual({ width: 780, height: 580 });

    setDimensions(1280, 720, 1260, 700);
    window.dispatchEvent(new Event('resize'));
    expect(component.size()).toEqual({ width: 1260, height: 700 });

    setDimensions(375, 812, 375, 812);
    window.dispatchEvent(new Event('resize'));
    expect(component.size()).toEqual({ width: 375, height: 812 });
  });
});

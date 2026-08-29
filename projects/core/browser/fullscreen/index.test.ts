import { Component, ElementRef, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { fullscreen } from './index';

describe(fullscreen.name, () => {
  let fullscreenElementValue: Element | null;
  let requestFullscreenSpy: jest.SpyInstance;
  let exitFullscreenSpy: jest.SpyInstance;

  beforeEach(() => {
    fullscreenElementValue = null;

    Object.defineProperty(document, 'fullscreenEnabled', {
      value: true,
      writable: true,
      configurable: true,
    });

    Object.defineProperty(document, 'fullscreenElement', {
      get: () => fullscreenElementValue,
      configurable: true,
    });

    Object.defineProperty(Element.prototype, 'requestFullscreen', {
      value: jest.fn().mockResolvedValue(undefined),
      writable: true,
      configurable: true,
    });

    requestFullscreenSpy = jest
      .spyOn(Element.prototype, 'requestFullscreen')
      .mockResolvedValue(undefined);

    exitFullscreenSpy = jest.fn().mockResolvedValue(undefined);
    (document as any).exitFullscreen = exitFullscreenSpy;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  @Component({ template: '{{ fs.isActive() }}' })
  class TestComponent {
    readonly fs = fullscreen();
  }

  const createComponent = () => {
    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    return fixture.componentInstance;
  };

  it('should update isActive when fullscreenchange event fires', () => {
    const component = createComponent();

    fullscreenElementValue = document.documentElement;
    document.dispatchEvent(new Event('fullscreenchange'));
    expect(component.fs.isActive()).toBe(true);

    fullscreenElementValue = null;
    document.dispatchEvent(new Event('fullscreenchange'));
    expect(component.fs.isActive()).toBe(false);
  });

  it('should call requestFullscreen on enter', async () => {
    const component = createComponent();
    await component.fs.enter();
    expect(requestFullscreenSpy).toHaveBeenCalled();
  });

  it('should call exitFullscreen on exit when target is fullscreen', async () => {
    const component = createComponent();

    fullscreenElementValue = document.documentElement;
    document.dispatchEvent(new Event('fullscreenchange'));

    await component.fs.exit();
    expect(exitFullscreenSpy).toHaveBeenCalled();
  });

  it('should not call exitFullscreen when target is not fullscreen', async () => {
    const component = createComponent();
    await component.fs.exit();
    expect(exitFullscreenSpy).not.toHaveBeenCalled();
  });

  it('should toggle between enter and exit', async () => {
    const component = createComponent();

    await component.fs.toggle();
    expect(requestFullscreenSpy).toHaveBeenCalled();

    fullscreenElementValue = document.documentElement;
    document.dispatchEvent(new Event('fullscreenchange'));

    await component.fs.toggle();
    expect(exitFullscreenSpy).toHaveBeenCalled();
  });

  it('should default target to document.documentElement', () => {
    const component = createComponent();

    fullscreenElementValue = document.documentElement;
    document.dispatchEvent(new Event('fullscreenchange'));
    expect(component.fs.isActive()).toBe(true);

    // A different element should not activate
    fullscreenElementValue = document.createElement('div');
    document.dispatchEvent(new Event('fullscreenchange'));
    expect(component.fs.isActive()).toBe(false);
  });

  describe('initial state', () => {
    it('should report a target that is already fullscreen at creation', () => {
      fullscreenElementValue = document.documentElement;

      const component = createComponent();

      expect(component.fs.isActive()).toBe(true);
    });

    it('should not report active when a different element is fullscreen', () => {
      fullscreenElementValue = document.createElement('div');

      const component = createComponent();

      expect(component.fs.isActive()).toBe(false);
    });

    it('should exit on toggle when created while already fullscreen', async () => {
      fullscreenElementValue = document.documentElement;

      const component = createComponent();
      await component.fs.toggle();

      expect(exitFullscreenSpy).toHaveBeenCalled();
      expect(requestFullscreenSpy).not.toHaveBeenCalled();
    });
  });

  describe('deferred target', () => {
    @Component({ template: '<div #box></div>{{ fs.isActive() }}' })
    class RequiredTargetComponent {
      readonly box = viewChild.required<ElementRef<HTMLElement>>('box');
      readonly fs = fullscreen({ target: this.box });
    }

    it('should not read a required query target during class field initialization', () => {
      // The eager read only happened when something was already fullscreen at creation time,
      // because `document.fullscreenElement != null` short-circuited the comparison.
      fullscreenElementValue = document.documentElement;

      expect(() => TestBed.createComponent(RequiredTargetComponent)).not.toThrow();
    });

    it('should resolve a required query target once the view is created', () => {
      fullscreenElementValue = document.documentElement;

      const fixture = TestBed.createComponent(RequiredTargetComponent);
      fixture.detectChanges();

      const component = fixture.componentInstance;

      fullscreenElementValue = component.box().nativeElement;
      document.dispatchEvent(new Event('fullscreenchange'));

      expect(component.fs.isActive()).toBe(true);
    });

    it('should recompute isActive when the target changes', () => {
      @Component({ template: '{{ fs.isActive() }}' })
      class SwappingTargetComponent {
        readonly target = signal<Element>(document.createElement('div'));
        readonly fs = fullscreen({ target: this.target });
      }

      const fixture = TestBed.createComponent(SwappingTargetComponent);
      fixture.detectChanges();

      const component = fixture.componentInstance;
      const other = document.createElement('section');

      fullscreenElementValue = other;
      document.dispatchEvent(new Event('fullscreenchange'));
      expect(component.fs.isActive()).toBe(false);

      component.target.set(other);
      expect(component.fs.isActive()).toBe(true);
    });
  });
});

import { Component, ElementRef, inject, signal, ViewEncapsulation, viewChild } from '@angular/core';
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

  describe('shadow dom', () => {
    // `document.fullscreenElement` is retargeted against the document tree: when the fullscreen
    // element lives in a shadow tree, the document reports its host instead.
    // See https://fullscreen.spec.whatwg.org/#dom-documentorshadowroot-fullscreenelement
    const mockShadowFullscreenElement = (root: ShadowRoot, element: Element | null) => {
      Object.defineProperty(root, 'fullscreenElement', {
        get: () => element,
        configurable: true,
      });
    };

    @Component({
      template: '<div #box></div>{{ fs.isActive() }}',
      encapsulation: ViewEncapsulation.ShadowDom,
    })
    class ShadowComponent {
      readonly box = viewChild.required<ElementRef<HTMLElement>>('box');
      readonly fs = fullscreen({ target: this.box });
    }

    const createShadowComponent = () => {
      const fixture = TestBed.createComponent(ShadowComponent);
      fixture.detectChanges();

      const component = fixture.componentInstance;

      return {
        component,
        host: fixture.nativeElement as Element,
        box: component.box().nativeElement,
      };
    };

    it('should report a target inside a shadow root as active', () => {
      const { component, host, box } = createShadowComponent();

      fullscreenElementValue = host;
      mockShadowFullscreenElement(host.shadowRoot!, box);
      document.dispatchEvent(new Event('fullscreenchange'));

      expect(component.fs.isActive()).toBe(true);
    });

    it('should exit a target inside a shadow root', async () => {
      const { component, host, box } = createShadowComponent();

      fullscreenElementValue = host;
      mockShadowFullscreenElement(host.shadowRoot!, box);
      document.dispatchEvent(new Event('fullscreenchange'));

      await component.fs.exit();

      expect(exitFullscreenSpy).toHaveBeenCalled();
    });

    it('should not enter again when the target inside a shadow root is already fullscreen', async () => {
      const { component, host, box } = createShadowComponent();

      fullscreenElementValue = host;
      mockShadowFullscreenElement(host.shadowRoot!, box);
      document.dispatchEvent(new Event('fullscreenchange'));

      await component.fs.enter();

      expect(requestFullscreenSpy).not.toHaveBeenCalled();
    });

    it('should not report the host as active when a nested element is fullscreen', () => {
      @Component({
        template: '<div #box></div>{{ fs.isActive() }}',
        encapsulation: ViewEncapsulation.ShadowDom,
      })
      class HostTargetComponent {
        readonly box = viewChild.required<ElementRef<HTMLElement>>('box');
        readonly host = inject(ElementRef<HTMLElement>);
        readonly fs = fullscreen({ target: this.host });
      }

      const fixture = TestBed.createComponent(HostTargetComponent);
      fixture.detectChanges();

      const component = fixture.componentInstance;
      const host = fixture.nativeElement as Element;

      fullscreenElementValue = host;
      mockShadowFullscreenElement(host.shadowRoot!, component.box().nativeElement);
      document.dispatchEvent(new Event('fullscreenchange'));

      expect(component.fs.isActive()).toBe(false);
    });

    it('should report a shadow host that is fullscreen itself as active', () => {
      @Component({
        template: '<div #box></div>{{ fs.isActive() }}',
        encapsulation: ViewEncapsulation.ShadowDom,
      })
      class HostTargetComponent {
        readonly host = inject(ElementRef<HTMLElement>);
        readonly fs = fullscreen({ target: this.host });
      }

      const fixture = TestBed.createComponent(HostTargetComponent);
      fixture.detectChanges();

      const component = fixture.componentInstance;
      const host = fixture.nativeElement as Element;

      // The host went fullscreen itself, so its shadow root reports no fullscreen element.
      fullscreenElementValue = host;
      mockShadowFullscreenElement(host.shadowRoot!, null);
      document.dispatchEvent(new Event('fullscreenchange'));

      expect(component.fs.isActive()).toBe(true);
    });
  });

  describe('concurrent transitions', () => {
    // Replaces the instant mock with a controllable one: the test decides when the browser
    // finishes the transition (resolves the native promise and fires `fullscreenchange`).
    let finishRequest: () => void;

    beforeEach(() => {
      requestFullscreenSpy.mockImplementation(
        () =>
          new Promise<void>(resolve => {
            finishRequest = () => {
              fullscreenElementValue = document.documentElement;
              document.dispatchEvent(new Event('fullscreenchange'));
              resolve();
            };
          })
      );
    });

    it('should not issue a second native request while enter is pending', async () => {
      const component = createComponent();

      const first = component.fs.enter();
      const second = component.fs.enter();

      finishRequest();
      await Promise.all([first, second]);

      expect(requestFullscreenSpy).toHaveBeenCalledTimes(1);
    });

    it('should make exit join a pending enter instead of racing it', async () => {
      const component = createComponent();

      const entering = component.fs.enter();
      const exiting = component.fs.exit();

      finishRequest();
      await Promise.all([entering, exiting]);

      expect(exitFullscreenSpy).not.toHaveBeenCalled();
      expect(component.fs.isActive()).toBe(true);
    });

    it('should enter exactly once on a double toggle', async () => {
      const component = createComponent();

      const first = component.fs.toggle();
      const second = component.fs.toggle();

      finishRequest();
      await Promise.all([first, second]);

      expect(requestFullscreenSpy).toHaveBeenCalledTimes(1);
      expect(exitFullscreenSpy).not.toHaveBeenCalled();
      expect(component.fs.isActive()).toBe(true);
    });

    it('should allow a new transition once the pending one settles', async () => {
      const component = createComponent();

      const entering = component.fs.enter();
      finishRequest();
      await entering;

      await component.fs.exit();

      expect(exitFullscreenSpy).toHaveBeenCalledTimes(1);
    });

    it('should release the pending transition when the native request rejects', async () => {
      const component = createComponent();

      requestFullscreenSpy.mockRejectedValueOnce(new TypeError('Permissions check failed'));

      await expect(component.fs.enter()).rejects.toThrow('Permissions check failed');

      const retry = component.fs.enter();
      finishRequest();
      await retry;

      expect(requestFullscreenSpy).toHaveBeenCalledTimes(2);
      expect(component.fs.isActive()).toBe(true);
    });

    it('should propagate the pending rejection to every joined caller', async () => {
      const component = createComponent();

      let rejectRequest: (error: Error) => void;
      requestFullscreenSpy.mockImplementationOnce(
        () =>
          new Promise<void>((_, reject) => {
            rejectRequest = reject;
          })
      );

      const first = component.fs.enter();
      const second = component.fs.enter();

      rejectRequest!(new TypeError('Permissions check failed'));

      await expect(first).rejects.toThrow('Permissions check failed');
      await expect(second).rejects.toThrow('Permissions check failed');
    });
  });
});

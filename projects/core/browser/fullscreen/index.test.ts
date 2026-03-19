import { Component } from '@angular/core';
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
});

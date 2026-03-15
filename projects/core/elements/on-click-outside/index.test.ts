import { Component, ElementRef, inject, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { onClickOutside } from './index';

// PointerEvent is not available in jsdom, polyfill it
if (typeof PointerEvent === 'undefined') {
  (globalThis as any).PointerEvent = class PointerEvent extends MouseEvent {
    readonly pointerId: number;
    readonly pointerType: string;

    constructor(type: string, params: PointerEventInit = {}) {
      super(type, params);
      this.pointerId = params.pointerId ?? 0;
      this.pointerType = params.pointerType ?? '';
    }
  };
}

describe(onClickOutside.name, () => {
  let outsideElement: HTMLElement;

  beforeEach(() => {
    outsideElement = document.createElement('div');
    outsideElement.id = 'outside';
    document.body.appendChild(outsideElement);
  });

  afterEach(() => {
    outsideElement.remove();
  });

  describe('with reactive target (signal query)', () => {
    it('should call handler when clicking outside the target', () => {
      const handler = jest.fn();

      @Component({ template: '<div #box>Content</div>' })
      class TestComponent {
        readonly box = viewChild<ElementRef>('box');
        readonly ref = onClickOutside(this.box, handler);
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      // Simulate pointerdown + pointerup outside
      outsideElement.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
      outsideElement.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should NOT call handler when clicking inside the target', () => {
      const handler = jest.fn();

      @Component({ template: '<div #box>Content</div>' })
      class TestComponent {
        readonly box = viewChild<ElementRef>('box');
        readonly ref = onClickOutside(this.box, handler);
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      const target = fixture.nativeElement.querySelector('div') as HTMLElement;

      target.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
      target.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));

      expect(handler).not.toHaveBeenCalled();
    });

    it('should handle multiple outside clicks', () => {
      const handler = jest.fn();

      @Component({ template: '<div #box>Content</div>' })
      class TestComponent {
        readonly box = viewChild<ElementRef>('box');
        readonly ref = onClickOutside(this.box, handler);
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      outsideElement.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
      outsideElement.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));

      outsideElement.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
      outsideElement.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));

      expect(handler).toHaveBeenCalledTimes(2);
    });
  });

  describe('with non-reactive target', () => {
    it('should detect clicks outside host element', () => {
      const handler = jest.fn();

      @Component({ template: '<span>inside</span>' })
      class TestComponent {
        readonly elementRef = inject(ElementRef);
        readonly ref = onClickOutside(this.elementRef, handler);
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      outsideElement.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
      outsideElement.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));

      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe('ignore option', () => {
    it('should NOT call handler when clicking on ignored element', () => {
      const handler = jest.fn();
      const ignoredElement = document.createElement('button');
      ignoredElement.id = 'ignored';
      document.body.appendChild(ignoredElement);

      @Component({ template: '<div #box>Content</div>' })
      class TestComponent {
        readonly box = viewChild<ElementRef>('box');
        readonly ref = onClickOutside(this.box, handler, {
          ignore: [ignoredElement],
        });
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      ignoredElement.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
      ignoredElement.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));

      expect(handler).not.toHaveBeenCalled();

      ignoredElement.remove();
    });
  });

  describe('destroy', () => {
    it('should stop listening after destroy', () => {
      const handler = jest.fn();

      @Component({ template: '<div #box>Content</div>' })
      class TestComponent {
        readonly box = viewChild<ElementRef>('box');
        readonly ref = onClickOutside(this.box, handler);
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      fixture.componentInstance.ref.destroy();

      outsideElement.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
      outsideElement.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));

      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('iframe detection', () => {
    it('should call handler when focus moves to an iframe outside target', () => {
      jest.useFakeTimers();
      const handler = jest.fn();

      const iframe = document.createElement('iframe');
      document.body.appendChild(iframe);

      @Component({ template: '<div #box>Content</div>' })
      class TestComponent {
        readonly box = viewChild<ElementRef>('box');
        readonly ref = onClickOutside(this.box, handler);
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      // Mock activeElement to be the iframe
      Object.defineProperty(document, 'activeElement', {
        value: iframe,
        writable: true,
        configurable: true,
      });

      window.dispatchEvent(new FocusEvent('blur'));
      jest.advanceTimersByTime(1);

      expect(handler).toHaveBeenCalledTimes(1);

      iframe.remove();
      jest.useRealTimers();
    });
  });
});

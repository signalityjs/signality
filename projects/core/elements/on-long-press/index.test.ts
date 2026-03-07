import { Component, ElementRef, inject, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { onLongPress } from './index';

// PointerEvent is not available in jsdom
if (typeof PointerEvent === 'undefined') {
  (globalThis as any).PointerEvent = class PointerEvent extends MouseEvent {
    readonly pointerId: number;
    readonly width: number;
    readonly height: number;
    readonly pressure: number;
    readonly tiltX: number;
    readonly tiltY: number;
    readonly pointerType: string;
    readonly isPrimary: boolean;

    constructor(type: string, params: PointerEventInit = {}) {
      super(type, params);
      this.pointerId = params.pointerId ?? 0;
      this.width = params.width ?? 1;
      this.height = params.height ?? 1;
      this.pressure = params.pressure ?? 0;
      this.tiltX = params.tiltX ?? 0;
      this.tiltY = params.tiltY ?? 0;
      this.pointerType = params.pointerType ?? '';
      this.isPrimary = params.isPrimary ?? false;
    }
  };
}

describe(onLongPress.name, () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('with reactive target (signal query)', () => {
    it('should fire callback after default delay', () => {
      const handler = jest.fn();

      @Component({ template: '<button #btn>Hold</button>' })
      class TestComponent {
        readonly btn = viewChild<ElementRef>('btn');
        readonly ref = onLongPress(this.btn, handler);
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

      button.dispatchEvent(
        new PointerEvent('pointerdown', { bubbles: true, clientX: 0, clientY: 0 })
      );

      jest.advanceTimersByTime(499);
      expect(handler).not.toHaveBeenCalled();

      jest.advanceTimersByTime(1);
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should fire callback after custom delay', () => {
      const handler = jest.fn();

      @Component({ template: '<button #btn>Hold</button>' })
      class TestComponent {
        readonly btn = viewChild<ElementRef>('btn');
        readonly ref = onLongPress(this.btn, handler, { delay: 1000 });
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

      button.dispatchEvent(
        new PointerEvent('pointerdown', { bubbles: true, clientX: 0, clientY: 0 })
      );

      jest.advanceTimersByTime(999);
      expect(handler).not.toHaveBeenCalled();

      jest.advanceTimersByTime(1);
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should NOT fire callback if released early', () => {
      const handler = jest.fn();

      @Component({ template: '<button #btn>Hold</button>' })
      class TestComponent {
        readonly btn = viewChild<ElementRef>('btn');
        readonly ref = onLongPress(this.btn, handler);
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

      button.dispatchEvent(
        new PointerEvent('pointerdown', { bubbles: true, clientX: 0, clientY: 0 })
      );
      jest.advanceTimersByTime(200);

      button.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
      jest.advanceTimersByTime(500);

      expect(handler).not.toHaveBeenCalled();
    });

    it('should NOT fire callback if pointer leaves element', () => {
      const handler = jest.fn();

      @Component({ template: '<button #btn>Hold</button>' })
      class TestComponent {
        readonly btn = viewChild<ElementRef>('btn');
        readonly ref = onLongPress(this.btn, handler);
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

      button.dispatchEvent(
        new PointerEvent('pointerdown', { bubbles: true, clientX: 0, clientY: 0 })
      );
      jest.advanceTimersByTime(200);

      button.dispatchEvent(new PointerEvent('pointerleave', { bubbles: true }));
      jest.advanceTimersByTime(500);

      expect(handler).not.toHaveBeenCalled();
    });

    it('should NOT fire callback if pointer moves beyond distance threshold', () => {
      const handler = jest.fn();

      @Component({ template: '<button #btn>Hold</button>' })
      class TestComponent {
        readonly btn = viewChild<ElementRef>('btn');
        readonly ref = onLongPress(this.btn, handler, { distanceThreshold: 10 });
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

      button.dispatchEvent(
        new PointerEvent('pointerdown', { bubbles: true, clientX: 0, clientY: 0 })
      );
      jest.advanceTimersByTime(100);

      // Move 15px — exceeds threshold of 10
      button.dispatchEvent(
        new PointerEvent('pointermove', { bubbles: true, clientX: 15, clientY: 0 })
      );
      jest.advanceTimersByTime(500);

      expect(handler).not.toHaveBeenCalled();
    });

    it('should fire callback if pointer moves within distance threshold', () => {
      const handler = jest.fn();

      @Component({ template: '<button #btn>Hold</button>' })
      class TestComponent {
        readonly btn = viewChild<ElementRef>('btn');
        readonly ref = onLongPress(this.btn, handler, { distanceThreshold: 10 });
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

      button.dispatchEvent(
        new PointerEvent('pointerdown', { bubbles: true, clientX: 0, clientY: 0 })
      );
      jest.advanceTimersByTime(100);

      // Move 5px — within threshold of 10
      button.dispatchEvent(
        new PointerEvent('pointermove', { bubbles: true, clientX: 3, clientY: 4 })
      );
      jest.advanceTimersByTime(400);

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should ignore distance threshold when set to false', () => {
      const handler = jest.fn();

      @Component({ template: '<button #btn>Hold</button>' })
      class TestComponent {
        readonly btn = viewChild<ElementRef>('btn');
        readonly ref = onLongPress(this.btn, handler, { distanceThreshold: false });
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

      button.dispatchEvent(
        new PointerEvent('pointerdown', { bubbles: true, clientX: 0, clientY: 0 })
      );
      jest.advanceTimersByTime(100);

      // Large movement — should be ignored
      button.dispatchEvent(
        new PointerEvent('pointermove', { bubbles: true, clientX: 100, clientY: 100 })
      );
      jest.advanceTimersByTime(400);

      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe('modifiers', () => {
    it('should NOT fire callback when required modifier is not held', () => {
      const handler = jest.fn();

      @Component({ template: '<button #btn>Hold</button>' })
      class TestComponent {
        readonly btn = viewChild<ElementRef>('btn');
        readonly ref = onLongPress(this.btn, handler, { modifiers: { ctrl: true } });
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

      button.dispatchEvent(
        new PointerEvent('pointerdown', { bubbles: true, clientX: 0, clientY: 0, ctrlKey: false })
      );
      jest.advanceTimersByTime(500);

      expect(handler).not.toHaveBeenCalled();
    });

    it('should fire callback when required modifier is held', () => {
      const handler = jest.fn();

      @Component({ template: '<button #btn>Hold</button>' })
      class TestComponent {
        readonly btn = viewChild<ElementRef>('btn');
        readonly ref = onLongPress(this.btn, handler, { modifiers: { ctrl: true } });
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

      button.dispatchEvent(
        new PointerEvent('pointerdown', { bubbles: true, clientX: 0, clientY: 0, ctrlKey: true })
      );
      jest.advanceTimersByTime(500);

      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe('with non-reactive target', () => {
    it('should fire callback after delay on host element', () => {
      const handler = jest.fn();

      @Component({ template: '' })
      class TestComponent {
        readonly elementRef = inject(ElementRef);
        readonly ref = onLongPress(this.elementRef, handler);
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      const element = fixture.nativeElement as HTMLElement;

      element.dispatchEvent(
        new PointerEvent('pointerdown', { bubbles: true, clientX: 0, clientY: 0 })
      );
      jest.advanceTimersByTime(500);

      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe('cleanup', () => {
    it('should cancel pending timer on component destroy', () => {
      const handler = jest.fn();

      @Component({ template: '<button #btn>Hold</button>' })
      class TestComponent {
        readonly btn = viewChild<ElementRef>('btn');
        readonly ref = onLongPress(this.btn, handler);
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

      button.dispatchEvent(
        new PointerEvent('pointerdown', { bubbles: true, clientX: 0, clientY: 0 })
      );
      jest.advanceTimersByTime(200);

      fixture.destroy();
      jest.advanceTimersByTime(500);

      expect(handler).not.toHaveBeenCalled();
    });
  });
});

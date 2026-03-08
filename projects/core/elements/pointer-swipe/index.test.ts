import { Component, ElementRef, inject, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { pointerSwipe } from './index';

// setPointerCapture is not available in jsdom
if (!Element.prototype.setPointerCapture) {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  Element.prototype.setPointerCapture = function () {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  Element.prototype.releasePointerCapture = function () {};
}

// PointerEvent is not available in jsdom
if (typeof PointerEvent === 'undefined') {
  (globalThis as any).PointerEvent = class PointerEvent extends MouseEvent {
    readonly pointerId: number;
    readonly pointerType: string;

    constructor(
      type: string,
      params: PointerEventInit & { pointerId?: number; pointerType?: string } = {}
    ) {
      super(type, { bubbles: true, ...params });
      this.pointerId = params.pointerId ?? 1;
      this.pointerType = params.pointerType ?? 'mouse';
    }
  };
}

function createPointerEvent(type: string, options: Partial<PointerEvent> = {}): PointerEvent {
  return new PointerEvent(type, {
    bubbles: true,
    clientX: (options as any).clientX ?? 0,
    clientY: (options as any).clientY ?? 0,
    pointerType: (options as any).pointerType ?? 'mouse',
    pointerId: (options as any).pointerId ?? 1,
    buttons: (options as any).buttons ?? (type === 'pointerdown' ? 1 : 0),
  });
}

function pointerDown(el: HTMLElement, x: number, y: number, pointerType = 'mouse') {
  el.dispatchEvent(
    createPointerEvent('pointerdown', { clientX: x, clientY: y, pointerType } as any)
  );
}

function pointerMove(el: HTMLElement, x: number, y: number, pointerType = 'mouse') {
  el.dispatchEvent(
    createPointerEvent('pointermove', { clientX: x, clientY: y, pointerType } as any)
  );
}

function pointerUp(el: HTMLElement, pointerType = 'mouse') {
  el.dispatchEvent(createPointerEvent('pointerup', { pointerType } as any));
}

describe(pointerSwipe.name, () => {
  describe('with reactive target (signal query)', () => {
    @Component({ template: '<div #area style="width:200px;height:200px">Swipe</div>' })
    class TestComponent {
      readonly area = viewChild<ElementRef>('area');
      readonly sw = pointerSwipe(this.area);
    }

    function createComponent() {
      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      return {
        component: fixture.componentInstance,
        target: fixture.nativeElement.querySelector('div') as HTMLElement,
      };
    }

    it('should initialize with default values', () => {
      const { component } = createComponent();

      expect(component.sw.isSwiping()).toBe(false);
      expect(component.sw.direction()).toBe('none');
      expect(component.sw.distanceX()).toBe(0);
      expect(component.sw.distanceY()).toBe(0);
    });

    it('should detect a left swipe', () => {
      const { component, target } = createComponent();

      pointerDown(target, 100, 50);
      pointerMove(target, 40, 50); // dx = 60, above threshold of 50

      expect(component.sw.isSwiping()).toBe(true);
      expect(component.sw.direction()).toBe('left');
      expect(component.sw.distanceX()).toBe(60);
    });

    it('should detect a right swipe', () => {
      const { component, target } = createComponent();

      pointerDown(target, 50, 50);
      pointerMove(target, 110, 50); // dx = -60

      expect(component.sw.isSwiping()).toBe(true);
      expect(component.sw.direction()).toBe('right');
      expect(component.sw.distanceX()).toBe(-60);
    });

    it('should detect an up swipe', () => {
      const { component, target } = createComponent();

      pointerDown(target, 50, 100);
      pointerMove(target, 50, 40); // dy = 60

      expect(component.sw.isSwiping()).toBe(true);
      expect(component.sw.direction()).toBe('up');
      expect(component.sw.distanceY()).toBe(60);
    });

    it('should detect a down swipe', () => {
      const { component, target } = createComponent();

      pointerDown(target, 50, 50);
      pointerMove(target, 50, 110); // dy = -60

      expect(component.sw.isSwiping()).toBe(true);
      expect(component.sw.direction()).toBe('down');
      expect(component.sw.distanceY()).toBe(-60);
    });

    it('should not trigger swipe below threshold', () => {
      const { component, target } = createComponent();

      pointerDown(target, 100, 50);
      pointerMove(target, 80, 50); // dx = 20, below threshold of 50

      expect(component.sw.isSwiping()).toBe(false);
      expect(component.sw.direction()).toBe('none');
    });

    it('should reset isSwiping on pointerup', () => {
      const { component, target } = createComponent();

      pointerDown(target, 100, 50);
      pointerMove(target, 40, 50);

      expect(component.sw.isSwiping()).toBe(true);

      pointerUp(target);

      expect(component.sw.isSwiping()).toBe(false);
    });

    it('should reset state on new pointerdown', () => {
      const { component, target } = createComponent();

      // First swipe
      pointerDown(target, 100, 50);
      pointerMove(target, 40, 50);
      expect(component.sw.direction()).toBe('left');

      // New pointer
      pointerDown(target, 50, 50);

      expect(component.sw.isSwiping()).toBe(false);
      expect(component.sw.direction()).toBe('none');
      expect(component.sw.distanceX()).toBe(0);
      expect(component.sw.distanceY()).toBe(0);
    });

    it('should work with touch pointer type', () => {
      const { component, target } = createComponent();

      pointerDown(target, 100, 50, 'touch');
      pointerMove(target, 40, 50, 'touch');

      expect(component.sw.isSwiping()).toBe(true);
      expect(component.sw.direction()).toBe('left');
    });

    it('should ignore pointermove without prior pointerdown', () => {
      const { component, target } = createComponent();

      pointerMove(target, 40, 50);

      expect(component.sw.isSwiping()).toBe(false);
      expect(component.sw.distanceX()).toBe(0);
    });
  });

  describe('with non-reactive target', () => {
    it('should detect swipe on host element', () => {
      @Component({ template: '' })
      class TestComponent {
        readonly elementRef = inject(ElementRef);
        readonly sw = pointerSwipe(this.elementRef);
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;

      pointerDown(el, 100, 50);
      pointerMove(el, 40, 50);

      expect(fixture.componentInstance.sw.isSwiping()).toBe(true);
      expect(fixture.componentInstance.sw.direction()).toBe('left');
    });
  });

  describe('custom threshold', () => {
    it('should use custom threshold', () => {
      @Component({ template: '<div #area>Swipe</div>' })
      class TestComponent {
        readonly area = viewChild<ElementRef>('area');
        readonly sw = pointerSwipe(this.area, { threshold: 100 });
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      const target = fixture.nativeElement.querySelector('div') as HTMLElement;

      pointerDown(target, 200, 50);
      pointerMove(target, 120, 50); // dx = 80, below threshold of 100

      expect(fixture.componentInstance.sw.isSwiping()).toBe(false);

      pointerMove(target, 90, 50); // dx = 110, above threshold of 100

      expect(fixture.componentInstance.sw.isSwiping()).toBe(true);
      expect(fixture.componentInstance.sw.direction()).toBe('left');
    });
  });

  describe('pointerTypes filtering', () => {
    it('should only respond to allowed pointer types', () => {
      @Component({ template: '<div #area>Swipe</div>' })
      class TestComponent {
        readonly area = viewChild<ElementRef>('area');
        readonly sw = pointerSwipe(this.area, { pointerTypes: ['touch'] });
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      const target = fixture.nativeElement.querySelector('div') as HTMLElement;

      // Mouse should be ignored
      pointerDown(target, 100, 50, 'mouse');
      pointerMove(target, 40, 50, 'mouse');

      expect(fixture.componentInstance.sw.isSwiping()).toBe(false);
      expect(fixture.componentInstance.sw.distanceX()).toBe(0);

      // Touch should work
      pointerDown(target, 100, 50, 'touch');
      pointerMove(target, 40, 50, 'touch');

      expect(fixture.componentInstance.sw.isSwiping()).toBe(true);
      expect(fixture.componentInstance.sw.direction()).toBe('left');
    });

    it('should allow multiple pointer types', () => {
      @Component({ template: '<div #area>Swipe</div>' })
      class TestComponent {
        readonly area = viewChild<ElementRef>('area');
        readonly sw = pointerSwipe(this.area, { pointerTypes: ['mouse', 'pen'] });
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      const target = fixture.nativeElement.querySelector('div') as HTMLElement;

      // Mouse should work
      pointerDown(target, 100, 50, 'mouse');
      pointerMove(target, 40, 50, 'mouse');

      expect(fixture.componentInstance.sw.isSwiping()).toBe(true);

      pointerUp(target);

      // Pen should work
      pointerDown(target, 100, 50, 'pen');
      pointerMove(target, 40, 50, 'pen');

      expect(fixture.componentInstance.sw.isSwiping()).toBe(true);

      pointerUp(target);

      // Touch should be ignored
      pointerDown(target, 100, 50, 'touch');
      pointerMove(target, 40, 50, 'touch');

      expect(fixture.componentInstance.sw.isSwiping()).toBe(false);
    });
  });
});

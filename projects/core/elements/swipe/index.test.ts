import { Component, ElementRef, inject, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { swipe } from './index';

function createTouch(x: number, y: number): Touch {
  return { clientX: x, clientY: y, identifier: 0 } as Touch;
}

function touchStart(el: HTMLElement, x: number, y: number) {
  el.dispatchEvent(new TouchEvent('touchstart', { touches: [createTouch(x, y)] } as any));
}

function touchMove(el: HTMLElement, x: number, y: number) {
  el.dispatchEvent(new TouchEvent('touchmove', { touches: [createTouch(x, y)] } as any));
}

function touchEnd(el: HTMLElement) {
  el.dispatchEvent(new TouchEvent('touchend', { touches: [] } as any));
}

describe(swipe.name, () => {
  describe('with reactive target (signal query)', () => {
    @Component({ template: '<div #area style="width:200px;height:200px">Swipe</div>' })
    class TestComponent {
      readonly area = viewChild<ElementRef>('area');
      readonly sw = swipe(this.area);
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

      touchStart(target, 100, 50);
      touchMove(target, 40, 50); // dx = 60, above threshold of 50

      expect(component.sw.isSwiping()).toBe(true);
      expect(component.sw.direction()).toBe('left');
      expect(component.sw.distanceX()).toBe(60);
    });

    it('should detect a right swipe', () => {
      const { component, target } = createComponent();

      touchStart(target, 50, 50);
      touchMove(target, 110, 50); // dx = -60

      expect(component.sw.isSwiping()).toBe(true);
      expect(component.sw.direction()).toBe('right');
      expect(component.sw.distanceX()).toBe(-60);
    });

    it('should detect an up swipe', () => {
      const { component, target } = createComponent();

      touchStart(target, 50, 100);
      touchMove(target, 50, 40); // dy = 60

      expect(component.sw.isSwiping()).toBe(true);
      expect(component.sw.direction()).toBe('up');
      expect(component.sw.distanceY()).toBe(60);
    });

    it('should detect a down swipe', () => {
      const { component, target } = createComponent();

      touchStart(target, 50, 50);
      touchMove(target, 50, 110); // dy = -60

      expect(component.sw.isSwiping()).toBe(true);
      expect(component.sw.direction()).toBe('down');
      expect(component.sw.distanceY()).toBe(-60);
    });

    it('should not trigger swipe below threshold', () => {
      const { component, target } = createComponent();

      touchStart(target, 100, 50);
      touchMove(target, 80, 50); // dx = 20, below threshold of 50

      expect(component.sw.isSwiping()).toBe(false);
      expect(component.sw.direction()).toBe('none');
    });

    it('should reset isSwiping on touchend', () => {
      const { component, target } = createComponent();

      touchStart(target, 100, 50);
      touchMove(target, 40, 50);

      expect(component.sw.isSwiping()).toBe(true);

      touchEnd(target);

      expect(component.sw.isSwiping()).toBe(false);
    });

    it('should reset state on new touchstart', () => {
      const { component, target } = createComponent();

      // First swipe
      touchStart(target, 100, 50);
      touchMove(target, 40, 50);
      expect(component.sw.direction()).toBe('left');

      // New touch
      touchStart(target, 50, 50);

      expect(component.sw.isSwiping()).toBe(false);
      expect(component.sw.direction()).toBe('none');
      expect(component.sw.distanceX()).toBe(0);
      expect(component.sw.distanceY()).toBe(0);
    });
  });

  describe('with non-reactive target', () => {
    it('should detect swipe on host element', () => {
      @Component({ template: '' })
      class TestComponent {
        readonly elementRef = inject(ElementRef);
        readonly sw = swipe(this.elementRef);
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;

      touchStart(el, 100, 50);
      touchMove(el, 40, 50);

      expect(fixture.componentInstance.sw.isSwiping()).toBe(true);
      expect(fixture.componentInstance.sw.direction()).toBe('left');
    });
  });

  describe('custom threshold', () => {
    it('should use custom threshold', () => {
      @Component({ template: '<div #area>Swipe</div>' })
      class TestComponent {
        readonly area = viewChild<ElementRef>('area');
        readonly sw = swipe(this.area, { threshold: 100 });
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      const target = fixture.nativeElement.querySelector('div') as HTMLElement;

      touchStart(target, 200, 50);
      touchMove(target, 120, 50); // dx = 80, below threshold of 100

      expect(fixture.componentInstance.sw.isSwiping()).toBe(false);

      touchMove(target, 90, 50); // dx = 110, above threshold of 100

      expect(fixture.componentInstance.sw.isSwiping()).toBe(true);
      expect(fixture.componentInstance.sw.direction()).toBe('left');
    });
  });
});

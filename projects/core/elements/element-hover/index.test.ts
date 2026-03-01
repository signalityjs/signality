import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { elementHover } from './index';

describe(elementHover.name, () => {
  describe('with reactive target (signal query)', () => {
    describe('hover state tracking', () => {
      @Component({
        template: '<div #box>Hover me</div>',
      })
      class TestComponent {
        readonly box = viewChild<ElementRef>('box');
        readonly isHovered = elementHover(this.box);
      }

      function createComponent() {
        const fixture = TestBed.createComponent(TestComponent);
        fixture.detectChanges();
        return {
          component: fixture.componentInstance,
          target: fixture.nativeElement.querySelector('div'),
        };
      }

      it('should be false initially', () => {
        const { component } = createComponent();

        expect(component.isHovered()).toBe(false);
      });

      it('should handle multiple hover cycles', () => {
        const { component, target } = createComponent();

        target.dispatchEvent(new MouseEvent('mouseenter'));
        expect(component.isHovered()).toBe(true);

        target.dispatchEvent(new MouseEvent('mouseleave'));
        expect(component.isHovered()).toBe(false);

        target.dispatchEvent(new MouseEvent('mouseenter'));
        expect(component.isHovered()).toBe(true);
      });
    });

    describe('child element destroy', () => {
      it('should reset to false when element is destroyed', () => {
        @Component({
          template: `
            @if (show()) {
            <div #box>Hover me</div>
            }
          `,
        })
        class ConditionalComponent {
          readonly box = viewChild<ElementRef>('box');
          readonly isHovered = elementHover(this.box);
          readonly show = signal(true);
        }

        const fixture = TestBed.createComponent(ConditionalComponent);
        fixture.detectChanges();
        const element = fixture.nativeElement.querySelector('div');
        element.dispatchEvent(new MouseEvent('mouseenter'));

        expect(fixture.componentInstance.isHovered()).toBe(true);

        fixture.componentInstance.show.set(false);
        fixture.detectChanges();

        expect(fixture.componentInstance.isHovered()).toBe(false);
      });
    });
  });

  describe('with non-reactive target', () => {
    describe('hover state tracking', () => {
      @Component({ template: '<div>Hover me</div>' })
      class TestComponent {
        readonly elementRef = inject(ElementRef);
        readonly isHovered = elementHover(this.elementRef);
      }

      function createComponent() {
        const fixture = TestBed.createComponent(TestComponent);
        fixture.detectChanges();
        return {
          component: fixture.componentInstance,
          target: fixture.nativeElement,
        };
      }

      it('should be false initially', () => {
        const { component } = createComponent();

        expect(component.isHovered()).toBe(false);
      });

      it('should handle multiple hover cycles', () => {
        const { component, target } = createComponent();

        target.dispatchEvent(new MouseEvent('mouseenter'));
        expect(component.isHovered()).toBe(true);

        target.dispatchEvent(new MouseEvent('mouseleave'));
        expect(component.isHovered()).toBe(false);

        target.dispatchEvent(new MouseEvent('mouseenter'));
        expect(component.isHovered()).toBe(true);
      });
    });

    describe('host element destroy', () => {
      it('should reset to false when component is destroyed', () => {
        @Component({
          template: '<div>Hover me</div>',
        })
        class TestComponent {
          readonly elementRef = inject(ElementRef);
          readonly isHovered = elementHover(this.elementRef);
        }

        const fixture = TestBed.createComponent(TestComponent);
        fixture.detectChanges();
        const element = fixture.nativeElement;
        element.dispatchEvent(new MouseEvent('mouseenter'));

        expect(fixture.componentInstance.isHovered()).toBe(true);

        fixture.destroy();

        expect(fixture.componentInstance.isHovered()).toBe(false);
      });
    });
  });
});

import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { elementFocus } from './index';

// @TODO: add tests with focusVisible
describe(elementFocus.name, () => {
  describe('with reactive target (signal query)', () => {
    describe('focus state tracking', () => {
      @Component({ template: '<input #input />' })
      class TestComponent {
        readonly input = viewChild<ElementRef>('input');
        readonly isFocused = elementFocus(this.input);
      }

      function createComponent() {
        const fixture = TestBed.createComponent(TestComponent);
        fixture.detectChanges();
        return {
          component: fixture.componentInstance,
          target: fixture.nativeElement.querySelector('input'),
        };
      }

      it('should be false initially', () => {
        const { component } = createComponent();

        expect(component.isFocused()).toBe(false);
      });

      it('should handle multiple focus cycles', () => {
        const { component, target } = createComponent();

        target.dispatchEvent(new FocusEvent('focus'));
        expect(component.isFocused()).toBe(true);

        target.dispatchEvent(new FocusEvent('blur'));
        expect(component.isFocused()).toBe(false);

        target.dispatchEvent(new FocusEvent('focus'));
        expect(component.isFocused()).toBe(true);
      });
    });

    describe('child element destroy', () => {
      it('should reset to false when element is destroyed', () => {
        @Component({
          template: `
            @if (show()) {
            <input #input />
            }
          `,
        })
        class ConditionalComponent {
          readonly input = viewChild<ElementRef>('input');
          readonly isFocused = elementFocus(this.input);
          readonly show = signal(true);
        }

        const fixture = TestBed.createComponent(ConditionalComponent);
        fixture.detectChanges();
        const element = fixture.nativeElement.querySelector('input');
        element.dispatchEvent(new FocusEvent('focus'));

        expect(fixture.componentInstance.isFocused()).toBe(true);

        fixture.componentInstance.show.set(false);
        fixture.detectChanges();

        expect(fixture.componentInstance.isFocused()).toBe(false);
      });
    });
  });

  describe('with non-reactive target', () => {
    describe('focus state tracking', () => {
      @Component({ template: '' })
      class TestComponent {
        readonly elementRef = inject(ElementRef);
        readonly isFocused = elementFocus(this.elementRef);
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

        expect(component.isFocused()).toBe(false);
      });

      it('should handle multiple focus cycles', () => {
        const { component, target } = createComponent();

        target.dispatchEvent(new FocusEvent('focus'));
        expect(component.isFocused()).toBe(true);

        target.dispatchEvent(new FocusEvent('blur'));
        expect(component.isFocused()).toBe(false);

        target.dispatchEvent(new FocusEvent('focus'));
        expect(component.isFocused()).toBe(true);
      });
    });

    describe('host element destroy', () => {
      it('should reset to false when component is destroyed', () => {
        @Component({
          template: '<input />',
        })
        class TestComponent {
          readonly elementRef = inject(ElementRef);
          readonly isFocused = elementFocus(this.elementRef);
        }

        const fixture = TestBed.createComponent(TestComponent);
        fixture.detectChanges();
        const element = fixture.nativeElement;
        element.dispatchEvent(new FocusEvent('focus'));

        expect(fixture.componentInstance.isFocused()).toBe(true);

        fixture.destroy();

        expect(fixture.componentInstance.isFocused()).toBe(false);
      });
    });
  });
});

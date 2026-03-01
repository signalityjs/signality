import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { elementFocusWithin } from './index';

describe(elementFocusWithin.name, () => {
  describe('with reactive target (signal query)', () => {
    describe('focus-within state tracking', () => {
      @Component({
        template: `
          <div #container>
            <input class="child-input" />
            <button class="child-button">Click</button>
          </div>
        `,
      })
      class TestComponent {
        readonly container = viewChild<ElementRef>('container');
        readonly isFocusedWithin = elementFocusWithin(this.container);
      }

      function createComponent() {
        const fixture = TestBed.createComponent(TestComponent);
        fixture.detectChanges();
        return {
          component: fixture.componentInstance,
          container: fixture.nativeElement.querySelector('div') as HTMLDivElement,
          input: fixture.nativeElement.querySelector('.child-input') as HTMLInputElement,
          button: fixture.nativeElement.querySelector('.child-button') as HTMLButtonElement,
        };
      }

      it('should be false initially', () => {
        const { component } = createComponent();

        expect(component.isFocusedWithin()).toBe(false);
      });

      it('should be true when a child receives focus', () => {
        const { component, input } = createComponent();

        input.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));

        expect(component.isFocusedWithin()).toBe(true);
      });

      it('should remain true when focus moves between children', () => {
        const { component, container, input, button } = createComponent();

        input.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
        expect(component.isFocusedWithin()).toBe(true);

        // Focus moves from input to button — relatedTarget is still inside container
        container.dispatchEvent(
          new FocusEvent('focusout', { bubbles: true, relatedTarget: button })
        );
        expect(component.isFocusedWithin()).toBe(true);
      });

      it('should be false when focus leaves the container', () => {
        const { component, container, input } = createComponent();

        input.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
        expect(component.isFocusedWithin()).toBe(true);

        // Focus leaves — relatedTarget is outside
        const outsideElement = document.createElement('div');
        container.dispatchEvent(
          new FocusEvent('focusout', { bubbles: true, relatedTarget: outsideElement })
        );
        expect(component.isFocusedWithin()).toBe(false);
      });

      it('should be false when focusout has null relatedTarget', () => {
        const { component, container, input } = createComponent();

        input.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
        expect(component.isFocusedWithin()).toBe(true);

        container.dispatchEvent(
          new FocusEvent('focusout', { bubbles: true, relatedTarget: null })
        );
        expect(component.isFocusedWithin()).toBe(false);
      });
    });

    describe('child element destroy', () => {
      it('should reset to false when element is destroyed', () => {
        @Component({
          template: `
            @if (show()) {
              <div #container>
                <input />
              </div>
            }
          `,
        })
        class ConditionalComponent {
          readonly container = viewChild<ElementRef>('container');
          readonly isFocusedWithin = elementFocusWithin(this.container);
          readonly show = signal(true);
        }

        const fixture = TestBed.createComponent(ConditionalComponent);
        fixture.detectChanges();

        const input = fixture.nativeElement.querySelector('input');
        input.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));

        expect(fixture.componentInstance.isFocusedWithin()).toBe(true);

        fixture.componentInstance.show.set(false);
        fixture.detectChanges();

        expect(fixture.componentInstance.isFocusedWithin()).toBe(false);
      });
    });
  });

  describe('with non-reactive target', () => {
    describe('focus-within state tracking', () => {
      @Component({
        template: `
          <input class="child-input" />
          <button class="child-button">Click</button>
        `,
      })
      class TestComponent {
        readonly elementRef = inject(ElementRef);
        readonly isFocusedWithin = elementFocusWithin(this.elementRef);
      }

      function createComponent() {
        const fixture = TestBed.createComponent(TestComponent);
        fixture.detectChanges();
        return {
          component: fixture.componentInstance,
          target: fixture.nativeElement as HTMLElement,
          input: fixture.nativeElement.querySelector('.child-input') as HTMLInputElement,
          button: fixture.nativeElement.querySelector('.child-button') as HTMLButtonElement,
        };
      }

      it('should be false initially', () => {
        const { component } = createComponent();

        expect(component.isFocusedWithin()).toBe(false);
      });

      it('should track focusin/focusout on host element', () => {
        const { component, target } = createComponent();

        target.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
        expect(component.isFocusedWithin()).toBe(true);

        const outsideElement = document.createElement('div');
        target.dispatchEvent(
          new FocusEvent('focusout', { bubbles: true, relatedTarget: outsideElement })
        );
        expect(component.isFocusedWithin()).toBe(false);
      });
    });

    describe('host element destroy', () => {
      it('should reset to false when component is destroyed', () => {
        @Component({ template: '<input />' })
        class TestComponent {
          readonly elementRef = inject(ElementRef);
          readonly isFocusedWithin = elementFocusWithin(this.elementRef);
        }

        const fixture = TestBed.createComponent(TestComponent);
        fixture.detectChanges();

        const element = fixture.nativeElement;
        element.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
        expect(fixture.componentInstance.isFocusedWithin()).toBe(true);

        fixture.destroy();
        expect(fixture.componentInstance.isFocusedWithin()).toBe(false);
      });
    });
  });
});

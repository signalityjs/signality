import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { elementFocus } from './index';

describe(elementFocus.name, () => {
  describe('with reactive target (signal query)', () => {
    describe('focus state tracking', () => {
      @Component({ template: '<input #input />' })
      class TestComponent {
        readonly input = viewChild<ElementRef>('input');
        readonly childFocused = elementFocus(this.input);
      }

      function createComponent() {
        const fixture = TestBed.createComponent(TestComponent);
        fixture.detectChanges();
        return {
          component: fixture.componentInstance,
          focusableChildEl: fixture.nativeElement.querySelector('input'),
        };
      }

      it('should be false initially', () => {
        const { component } = createComponent();

        expect(component.childFocused()).toBe(false);
      });

      it('should handle multiple focus cycles', () => {
        const { component, focusableChildEl } = createComponent();

        focusableChildEl.dispatchEvent(new FocusEvent('focus'));
        expect(component.childFocused()).toBe(true);

        focusableChildEl.dispatchEvent(new FocusEvent('blur'));
        expect(component.childFocused()).toBe(false);

        focusableChildEl.dispatchEvent(new FocusEvent('focus'));
        expect(component.childFocused()).toBe(true);
      });
    });

    describe('child element destroy', () => {
      it('should reset to false when element is destroyed', () => {
        @Component({
          template: `
            @if (childShown()) {
            <input #input />
            }
          `,
        })
        class ConditionalComponent {
          readonly input = viewChild<ElementRef>('input');
          readonly childFocused = elementFocus(this.input);
          readonly childShown = signal(true);
        }

        const fixture = TestBed.createComponent(ConditionalComponent);
        fixture.detectChanges();
        const element = fixture.nativeElement.querySelector('input');
        element.dispatchEvent(new FocusEvent('focus'));

        expect(fixture.componentInstance.childFocused()).toBe(true);

        fixture.componentInstance.childShown.set(false);
        fixture.detectChanges();

        expect(fixture.componentInstance.childFocused()).toBe(false);
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
          componentHostEl: fixture.nativeElement,
        };
      }

      it('should be false initially', () => {
        const { component } = createComponent();

        expect(component.isFocused()).toBe(false);
      });

      it('should handle multiple focus cycles', () => {
        const { component, componentHostEl } = createComponent();

        componentHostEl.dispatchEvent(new FocusEvent('focus'));
        expect(component.isFocused()).toBe(true);

        componentHostEl.dispatchEvent(new FocusEvent('blur'));
        expect(component.isFocused()).toBe(false);

        componentHostEl.dispatchEvent(new FocusEvent('focus'));
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

  describe('focus control via set()', () => {
    @Component({ template: '<input #input />' })
    class TestComponent {
      readonly input = viewChild<ElementRef>('input');
      readonly childFocused = elementFocus(this.input);
    }

    function createComponent() {
      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      return {
        component: fixture.componentInstance,
        focusableChildEl: fixture.nativeElement.querySelector('input') as HTMLInputElement,
      };
    }

    it('should set focus when set(true) is called', () => {
      const { component, focusableChildEl } = createComponent();

      component.childFocused.set(true);

      expect(focusableChildEl).toBe(document.activeElement);
      expect(component.childFocused()).toBe(true);
    });

    it('should remove focus when set(false) is called', () => {
      const { component, focusableChildEl } = createComponent();

      focusableChildEl.focus();
      expect(component.childFocused()).toBe(true);

      component.childFocused.set(false);

      expect(focusableChildEl).not.toBe(document.activeElement);
      expect(component.childFocused()).toBe(false);
    });

    it('should not call focus() if already focused', () => {
      const { component, focusableChildEl } = createComponent();

      focusableChildEl.focus();
      const spy = jest.spyOn(focusableChildEl, 'focus');

      component.childFocused.set(true);

      expect(spy).not.toHaveBeenCalled();
    });

    it('should not call blur() if not focused', () => {
      const { component, focusableChildEl } = createComponent();
      const spy = jest.spyOn(focusableChildEl, 'blur');

      component.childFocused.set(false);

      expect(spy).not.toHaveBeenCalled();
    });

    it('should support update() method', () => {
      const { component } = createComponent();

      component.childFocused.set(true);
      expect(component.childFocused()).toBe(true);

      component.childFocused.update(v => !v);
      expect(component.childFocused()).toBe(false);
    });
  });

  describe('preventScroll option', () => {
    @Component({ template: '<input #input />' })
    class TestComponent {
      readonly input = viewChild<ElementRef>('input');
      readonly childFocused = elementFocus(this.input, { preventScroll: true });
    }

    function createComponent() {
      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      return {
        component: fixture.componentInstance,
        focusableChildEl: fixture.nativeElement.querySelector('input') as HTMLInputElement,
      };
    }

    it('should call focus with preventScroll option', () => {
      const { component, focusableChildEl } = createComponent();
      const spy = jest.spyOn(focusableChildEl, 'focus');

      component.childFocused.set(true);

      expect(spy).toHaveBeenCalledWith({ preventScroll: true });
    });
  });
});

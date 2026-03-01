import { Component, ElementRef, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { textDirection } from './index';

describe(textDirection.name, () => {
  describe('default target (document.documentElement)', () => {
    beforeEach(() => {
      document.documentElement.removeAttribute('dir');
    });

    afterEach(() => {
      document.documentElement.removeAttribute('dir');
    });

    @Component({ template: '' })
    class TestComponent {
      readonly dir = textDirection();
    }

    const createComponent = () => {
      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      return fixture.componentInstance;
    };


    it('should return initial value when no dir attribute', () => {
      const component = createComponent();

      expect(component.dir()).toBe('ltr');
    });

    it('should read existing dir attribute', () => {
      document.documentElement.setAttribute('dir', 'rtl');
      const component = createComponent();

      expect(component.dir()).toBe('rtl');
    });

    it('should set dir attribute', () => {
      const component = createComponent();

      component.dir.set('rtl');

      expect(component.dir()).toBe('rtl');
      expect(document.documentElement.getAttribute('dir')).toBe('rtl');
    });

    it('should update when dir attribute changes externally', () => {
      const component = createComponent();

      expect(component.dir()).toBe('ltr');

      document.documentElement.setAttribute('dir', 'rtl');

      // wait for MutationObserver
      return new Promise(resolve => {
        setTimeout(() => {
          expect(component.dir()).toBe('rtl');
          resolve(undefined);
        }, 0);
      });
    });

    it('should handle all direction values', () => {
      const component = createComponent();

      component.dir.set('ltr');
      expect(component.dir()).toBe('ltr');
      expect(document.documentElement.getAttribute('dir')).toBe('ltr');

      component.dir.set('rtl');
      expect(component.dir()).toBe('rtl');
      expect(document.documentElement.getAttribute('dir')).toBe('rtl');

      component.dir.set('auto');
      expect(component.dir()).toBe('auto');
      expect(document.documentElement.getAttribute('dir')).toBe('auto');
    });
  });

  describe('custom target', () => {
    @Component({
      template: '<div #target>Content</div>',
    })
    class TestComponent {
      readonly target = viewChild<ElementRef<HTMLElement>>('target');
      readonly dir = textDirection({ target: this.target });
    }

    const createComponent = () => {
      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      return {
        component: fixture.componentInstance,
        element: fixture.nativeElement.querySelector('div') as HTMLElement,
      };
    };

    it('should read dir from custom element', () => {
      const { component, element } = createComponent();

      element.setAttribute('dir', 'rtl');

      // trigger re-read
      return new Promise(resolve => {
        setTimeout(() => {
          expect(component.dir()).toBe('rtl');
          resolve(undefined);
        }, 0);
      });
    });

    it('should set dir on custom element', () => {
      const { component, element } = createComponent();

      component.dir.set('rtl');

      expect(component.dir()).toBe('rtl');
      expect(element.getAttribute('dir')).toBe('rtl');
    });

    it('should observe changes on custom element', () => {
      const { component, element } = createComponent();

      element.setAttribute('dir', 'rtl');

      return new Promise(resolve => {
        setTimeout(() => {
          expect(component.dir()).toBe('rtl');

          element.setAttribute('dir', 'ltr');

          setTimeout(() => {
            expect(component.dir()).toBe('ltr');
            resolve(undefined);
          }, 0);
        }, 0);
      });
    });
  });

  describe('with custom initialValue', () => {
    @Component({ template: '' })
    class TestComponent {
      readonly dir = textDirection({ initialValue: 'rtl' });
    }

    const createComponent = () => {
      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      return fixture.componentInstance;
    };

    beforeEach(() => {
      document.documentElement.removeAttribute('dir');
    });

    afterEach(() => {
      document.documentElement.removeAttribute('dir');
    });

    it('should use custom initial value', () => {
      const component = createComponent();

      expect(component.dir()).toBe('rtl');
    });

    it('should prefer attribute over initial value', () => {
      document.documentElement.setAttribute('dir', 'ltr');
      const component = createComponent();

      expect(component.dir()).toBe('ltr');
    });
  });
});

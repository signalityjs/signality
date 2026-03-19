import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { debounced } from './index';

describe(debounced.name, () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('readonly signal from source', () => {
    @Component({ template: '{{ debouncedValue() }}' })
    class TestComponent {
      readonly source = signal('initial');
      readonly debouncedValue = debounced(this.source, 300);
    }

    const createComponent = () => {
      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      return {
        component: fixture.componentInstance,
        detectChanges: () => fixture.detectChanges(),
      };
    };

    it('should return initial value immediately', () => {
      const { component } = createComponent();

      expect(component.debouncedValue()).toBe('initial');
    });

    it('should debounce updates from source signal', () => {
      const { component, detectChanges } = createComponent();

      component.source.set('updated');
      detectChanges();
      expect(component.debouncedValue()).toBe('initial');

      jest.advanceTimersByTime(299);
      expect(component.debouncedValue()).toBe('initial');

      jest.advanceTimersByTime(1);
      expect(component.debouncedValue()).toBe('updated');
    });

    it('should reset debounce timer on multiple updates', () => {
      const { component, detectChanges } = createComponent();

      component.source.set('first');
      jest.advanceTimersByTime(100);
      component.source.set('second');
      jest.advanceTimersByTime(100);
      component.source.set('third');
      jest.advanceTimersByTime(299);
      detectChanges();
      expect(component.debouncedValue()).toBe('initial');

      jest.advanceTimersByTime(1);
      expect(component.debouncedValue()).toBe('third');
    });
  });

  describe('writable signal from value', () => {
    @Component({ template: '{{ debouncedValue() }}' })
    class TestComponent {
      readonly debouncedValue = debounced('initial', 300);
    }

    const createComponent = () => {
      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      return {
        component: fixture.componentInstance,
        detectChanges: () => fixture.detectChanges(),
      };
    };

    it('should return initial value immediately', () => {
      const { component } = createComponent();

      expect(component.debouncedValue()).toBe('initial');
    });

    it('should debounce set() calls', () => {
      const { component, detectChanges } = createComponent();

      component.debouncedValue.set('updated');
      detectChanges();
      expect(component.debouncedValue()).toBe('initial');

      jest.advanceTimersByTime(299);
      expect(component.debouncedValue()).toBe('initial');

      jest.advanceTimersByTime(1);
      expect(component.debouncedValue()).toBe('updated');
    });

    it('should debounce update() calls', () => {
      const { component, detectChanges } = createComponent();

      component.debouncedValue.update(v => v + '1');
      jest.advanceTimersByTime(100);
      component.debouncedValue.update(v => v + '2');
      jest.advanceTimersByTime(100);
      component.debouncedValue.update(v => v + '3');
      jest.advanceTimersByTime(299);
      detectChanges();
      expect(component.debouncedValue()).toBe('initial');

      jest.advanceTimersByTime(1);
      expect(component.debouncedValue()).toBe('initial3');
    });
  });

  describe('reactive debounce time', () => {
    @Component({ template: '{{ debouncedValue() }}' })
    class TestComponent {
      readonly source = signal('initial');
      readonly delay = signal(300);
      readonly debouncedValue = debounced(this.source, this.delay);
    }

    const createComponent = () => {
      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      return {
        component: fixture.componentInstance,
        detectChanges: () => fixture.detectChanges(),
      };
    };

    it('should handle reactive debounce time', () => {
      const { component, detectChanges } = createComponent();

      component.source.set('updated');
      detectChanges();
      jest.advanceTimersByTime(299);
      expect(component.debouncedValue()).toBe('initial');

      jest.advanceTimersByTime(1);
      expect(component.debouncedValue()).toBe('updated');

      component.delay.set(500);
      component.source.set('new value');
      detectChanges();
      jest.advanceTimersByTime(300);
      expect(component.debouncedValue()).not.toBe('new value');

      jest.advanceTimersByTime(199);
      expect(component.debouncedValue()).not.toBe('new value');

      jest.advanceTimersByTime(1);
      expect(component.debouncedValue()).toBe('new value');
    });
  });
});

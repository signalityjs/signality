import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { throttled } from './index';

describe(throttled.name, () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('readonly signal from source', () => {
    @Component({ template: '{{ throttledValue() }}' })
    class TestComponent {
      readonly source = signal('initial');
      readonly throttledValue = throttled(this.source, 300);
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

      expect(component.throttledValue()).toBe('initial');
    });

    it('should update without delay on first change', () => {
      const { component, detectChanges } = createComponent();

      component.source.set('first update');
      detectChanges();

      expect(component.throttledValue()).toBe('first update');
    });

    it('should throttle subsequent updates within time window', () => {
      const { component, detectChanges } = createComponent();

      component.source.set('first');
      detectChanges();
      expect(component.throttledValue()).toBe('first');

      component.source.set('second');
      detectChanges();
      expect(component.throttledValue()).toBe('first');

      component.source.set('third');
      detectChanges();
      expect(component.throttledValue()).toBe('first');

      jest.advanceTimersByTime(300);
      component.source.set('fourth');
      detectChanges();
      expect(component.throttledValue()).toBe('fourth');
    });

    it('should allow updates after throttle interval', () => {
      const { component, detectChanges } = createComponent();

      component.source.set('first');
      detectChanges();
      expect(component.throttledValue()).toBe('first');

      jest.advanceTimersByTime(299);
      component.source.set('second');
      detectChanges();
      expect(component.throttledValue()).toBe('first');

      jest.advanceTimersByTime(1);
      component.source.set('third');
      detectChanges();
      expect(component.throttledValue()).toBe('third');
    });
  });

  describe('writable signal from value', () => {
    @Component({ template: '{{ throttledValue() }}' })
    class TestComponent {
      readonly throttledValue = throttled('initial', 300);
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

      expect(component.throttledValue()).toBe('initial');
    });

    it('should throttle set() calls', () => {
      const { component, detectChanges } = createComponent();

      component.throttledValue.set('first');
      detectChanges();
      expect(component.throttledValue()).toBe('first');

      component.throttledValue.set('second');
      detectChanges();
      expect(component.throttledValue()).toBe('first');

      jest.advanceTimersByTime(300);
      component.throttledValue.set('third');
      detectChanges();
      expect(component.throttledValue()).toBe('third');
    });

    it('should throttle update() calls', () => {
      const { component, detectChanges } = createComponent();

      component.throttledValue.update(v => v + '1');
      detectChanges();
      expect(component.throttledValue()).toBe('initial1');

      component.throttledValue.update(v => v + '2');
      detectChanges();
      expect(component.throttledValue()).toBe('initial1');

      component.throttledValue.update(v => v + '3');
      detectChanges();
      expect(component.throttledValue()).toBe('initial1');

      jest.advanceTimersByTime(300);
      component.throttledValue.update(v => v + '4');
      detectChanges();
      expect(component.throttledValue()).toBe('initial14');
    });
  });

  describe('reactive throttle time', () => {
    @Component({ template: '{{ throttledValue() }}' })
    class TestComponent {
      readonly source = signal('initial');
      readonly delay = signal(300);
      readonly throttledValue = throttled(this.source, this.delay);
    }

    const createComponent = () => {
      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      return {
        component: fixture.componentInstance,
        detectChanges: () => fixture.detectChanges(),
      };
    };

    it('should handle reactive throttle time', () => {
      const { component, detectChanges } = createComponent();

      component.source.set('first');
      detectChanges();
      expect(component.throttledValue()).toBe('first');

      component.source.set('second');
      detectChanges();
      expect(component.throttledValue()).toBe('first');

      jest.advanceTimersByTime(300);
      component.delay.set(500);
      component.source.set('third');
      detectChanges();
      expect(component.throttledValue()).toBe('third');

      component.source.set('fourth');
      detectChanges();
      expect(component.throttledValue()).toBe('third');

      jest.advanceTimersByTime(499);
      component.source.set('fifth');
      detectChanges();
      expect(component.throttledValue()).toBe('third');

      jest.advanceTimersByTime(1);
      component.source.set('sixth');
      detectChanges();
      expect(component.throttledValue()).toBe('sixth');
    });
  });
});

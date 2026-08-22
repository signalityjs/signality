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
      expect(component.throttledValue()).toBe('third');
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
      expect(component.throttledValue()).toBe('second');

      component.source.set('third');
      detectChanges();
      jest.advanceTimersByTime(300);
      expect(component.throttledValue()).toBe('third');
    });

    it('should settle on the source value once updates stop', () => {
      const { component, detectChanges } = createComponent();

      component.source.set('a');
      detectChanges();
      expect(component.throttledValue()).toBe('a');

      component.source.set('final');
      detectChanges();

      jest.advanceTimersByTime(10_000);

      expect(component.throttledValue()).toBe('final');
    });

    it('should keep dropping updates when trailing is disabled', () => {
      @Component({ template: '{{ throttledValue() }}' })
      class NoTrailingComponent {
        readonly source = signal('initial');
        readonly throttledValue = throttled(this.source, 300, { trailing: false });
      }

      const fixture = TestBed.createComponent(NoTrailingComponent);
      fixture.detectChanges();
      const component = fixture.componentInstance;

      component.source.set('a');
      fixture.detectChanges();
      expect(component.throttledValue()).toBe('a');

      component.source.set('final');
      fixture.detectChanges();

      jest.advanceTimersByTime(10_000);

      expect(component.throttledValue()).toBe('a');
    });

    it('should defer the first update when leading is disabled', () => {
      @Component({ template: '{{ throttledValue() }}' })
      class NoLeadingComponent {
        readonly source = signal('initial');
        readonly throttledValue = throttled(this.source, 300, { leading: false });
      }

      const fixture = TestBed.createComponent(NoLeadingComponent);
      fixture.detectChanges();
      const component = fixture.componentInstance;

      component.source.set('a');
      fixture.detectChanges();
      expect(component.throttledValue()).toBe('initial');

      component.source.set('final');
      fixture.detectChanges();
      expect(component.throttledValue()).toBe('initial');

      jest.advanceTimersByTime(300);

      expect(component.throttledValue()).toBe('final');
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
      expect(component.throttledValue()).toBe('second');
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
      expect(component.throttledValue()).toBe('initial13');
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
      expect(component.throttledValue()).toBe('second');

      // drain the interval opened by the trailing update, so the next one uses the new delay
      jest.advanceTimersByTime(300);
      component.delay.set(500);

      component.source.set('third');
      detectChanges();
      expect(component.throttledValue()).toBe('third');

      component.source.set('fourth');
      detectChanges();
      expect(component.throttledValue()).toBe('third');

      jest.advanceTimersByTime(499);
      expect(component.throttledValue()).toBe('third');

      jest.advanceTimersByTime(1);
      expect(component.throttledValue()).toBe('fourth');
    });
  });
});

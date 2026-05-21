import { vi } from 'vitest';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { interval } from './index';

describe(interval.name, () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('core behavior', () => {
    @Component({ template: '' })
    class TestComponent {
      callCount = 0;

      readonly ref = interval(() => {
        this.callCount++;
      }, 1000);
    }

    const createComponent = () => {
      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      return fixture.componentInstance;
    };

    it('should not fire callback before interval elapses', () => {
      const component = createComponent();

      vi.advanceTimersByTime(999);

      expect(component.callCount).toBe(0);
    });

    it('should execute callback at specified interval', () => {
      const component = createComponent();

      vi.advanceTimersByTime(1000);

      expect(component.callCount).toBe(1);
    });

    it('should execute callback multiple times across intervals', () => {
      const component = createComponent();

      vi.advanceTimersByTime(3000);

      expect(component.callCount).toBe(3);
    });
  });

  describe('destroy behavior', () => {
    @Component({ template: '' })
    class TestComponent {
      callCount = 0;

      readonly ref = interval(() => {
        this.callCount++;
      }, 1000);
    }

    const createComponent = () => {
      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      return fixture.componentInstance;
    };

    it('should prevent further callbacks after destroy()', () => {
      const component = createComponent();

      vi.advanceTimersByTime(1000);
      expect(component.callCount).toBe(1);

      component.ref.destroy();

      vi.advanceTimersByTime(3000);

      expect(component.callCount).toBe(1);
    });

    it('should be safe to call destroy() multiple times', () => {
      const component = createComponent();

      component.ref.destroy();
      component.ref.destroy();

      vi.advanceTimersByTime(3000);

      expect(component.callCount).toBe(0);
    });
  });

  describe('immediate option', () => {
    @Component({ template: '' })
    class ImmediateComponent {
      callCount = 0;

      readonly ref = interval(
        () => {
          this.callCount++;
        },
        1000,
        { immediate: true }
      );
    }

    const createComponent = () => {
      const fixture = TestBed.createComponent(ImmediateComponent);
      fixture.detectChanges();
      return fixture.componentInstance;
    };

    it('should fire callback synchronously on creation', () => {
      const component = createComponent();

      expect(component.callCount).toBe(1);
    });

    it('should continue normal interval ticks after immediate call', () => {
      const component = createComponent();

      expect(component.callCount).toBe(1);

      vi.advanceTimersByTime(1000);
      expect(component.callCount).toBe(2);

      vi.advanceTimersByTime(1000);
      expect(component.callCount).toBe(3);
    });
  });

  describe('reactive intervalMs', () => {
    @Component({ template: '' })
    class ReactiveComponent {
      callCount = 0;

      readonly ms = signal(1000);

      readonly ref = interval(() => {
        this.callCount++;
      }, this.ms);
    }

    const createComponent = () => {
      const fixture = TestBed.createComponent(ReactiveComponent);
      fixture.detectChanges();
      return {
        component: fixture.componentInstance,
        fixture,
      };
    };

    it('should restart interval when signal changes', () => {
      const { component } = createComponent();

      vi.advanceTimersByTime(1000);
      expect(component.callCount).toBe(1);

      component.ms.set(500);
      TestBed.tick();

      component.callCount = 0;

      vi.advanceTimersByTime(500);
      expect(component.callCount).toBe(1);

      vi.advanceTimersByTime(500);
      expect(component.callCount).toBe(2);
    });

    it('should stop firing when intervalMs changes to zero', () => {
      const { component } = createComponent();

      vi.advanceTimersByTime(1000);
      expect(component.callCount).toBe(1);

      component.ms.set(0);
      TestBed.tick();

      vi.advanceTimersByTime(5000);

      expect(component.callCount).toBe(1);
    });

    it('should stop firing when intervalMs changes to negative', () => {
      const { component } = createComponent();

      vi.advanceTimersByTime(1000);
      expect(component.callCount).toBe(1);

      component.ms.set(-100);
      TestBed.tick();

      vi.advanceTimersByTime(5000);

      expect(component.callCount).toBe(1);
    });

    it('should not restart after destroy() even if signal changes', () => {
      const { component } = createComponent();

      component.ref.destroy();

      component.ms.set(500);
      TestBed.tick();

      vi.advanceTimersByTime(5000);

      expect(component.callCount).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('should not start interval when intervalMs is zero', () => {
      @Component({ template: '' })
      class ZeroMsComponent {
        callCount = 0;
        readonly ref = interval(() => {
          this.callCount++;
        }, 0);
      }

      const fixture = TestBed.createComponent(ZeroMsComponent);
      fixture.detectChanges();
      const component = fixture.componentInstance;

      vi.advanceTimersByTime(5000);

      expect(component.callCount).toBe(0);
    });

    it('should not start interval when intervalMs is negative', () => {
      @Component({ template: '' })
      class NegativeMsComponent {
        callCount = 0;
        readonly ref = interval(() => {
          this.callCount++;
        }, -1000);
      }

      const fixture = TestBed.createComponent(NegativeMsComponent);
      fixture.detectChanges();
      const component = fixture.componentInstance;

      vi.advanceTimersByTime(5000);

      expect(component.callCount).toBe(0);
    });

    it('should stop interval on component destroy', () => {
      @Component({ template: '' })
      class DestroyComponent {
        callCount = 0;
        readonly ref = interval(() => {
          this.callCount++;
        }, 1000);
      }

      const fixture = TestBed.createComponent(DestroyComponent);
      fixture.detectChanges();
      const component = fixture.componentInstance;

      vi.advanceTimersByTime(1000);
      expect(component.callCount).toBe(1);

      fixture.destroy();

      vi.advanceTimersByTime(3000);

      expect(component.callCount).toBe(1);
    });
  });
});

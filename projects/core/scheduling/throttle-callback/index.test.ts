import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { throttleCallback } from './index';

describe(throttleCallback.name, () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  @Component({ template: '' })
  class TestComponent {
    callCount = 0;
    lastValue: any;

    readonly throttledFn = throttleCallback((value: string) => {
      this.callCount++;
      this.lastValue = value;
    }, 300);
  }

  const createComponent = () => {
    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    return fixture.componentInstance;
  };

  it('should execute callback immediately on first call', () => {
    const component = createComponent();

    component.throttledFn('first');

    expect(component.callCount).toBe(1);
    expect(component.lastValue).toBe('first');
  });

  it('should throttle subsequent calls', () => {
    const component = createComponent();

    component.throttledFn('first');
    component.throttledFn('second');
    component.throttledFn('third');

    expect(component.callCount).toBe(1);
    expect(component.lastValue).toBe('first');
  });

  it('should deliver the queued call once the wait time elapses', () => {
    const component = createComponent();

    component.throttledFn('first');
    expect(component.callCount).toBe(1);

    jest.advanceTimersByTime(299);
    component.throttledFn('second');
    expect(component.callCount).toBe(1);

    jest.advanceTimersByTime(1);
    expect(component.callCount).toBe(2);
    expect(component.lastValue).toBe('second');
  });

  it('should handle multiple throttle cycles', () => {
    const component = createComponent();

    component.throttledFn('first');
    expect(component.callCount).toBe(1);

    jest.advanceTimersByTime(300);
    component.throttledFn('second');
    expect(component.callCount).toBe(2);

    jest.advanceTimersByTime(300);
    component.throttledFn('third');
    expect(component.callCount).toBe(3);

    expect(component.lastValue).toBe('third');
  });

  it('should preserve function arguments', () => {
    @Component({ template: '' })
    class MultiArgComponent {
      result: any;

      readonly throttled = throttleCallback((a: number, b: string, c: boolean) => {
        this.result = { a, b, c };
      }, 300);
    }

    const fixture = TestBed.createComponent(MultiArgComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component.throttled(42, 'test', true);

    expect(component.result).toEqual({ a: 42, b: 'test', c: true });
  });

  it('should preserve this context', () => {
    @Component({ template: '' })
    class ContextComponent {
      value = 'component';
      capturedThis: any;

      readonly throttledFn = throttleCallback(function (this: ContextComponent) {
        this.capturedThis = this;
      }, 300);
    }

    const fixture = TestBed.createComponent(ContextComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component.throttledFn();

    expect(component.capturedThis).toBe(component);
    expect(component.capturedThis.value).toBe('component');
  });

  describe('rapid calls', () => {
    it('should only execute once during throttle period', () => {
      const component = createComponent();

      for (let i = 0; i < 10; i++) {
        component.throttledFn(`call-${i}`);
      }

      expect(component.callCount).toBe(1);
      expect(component.lastValue).toBe('call-0');
    });

    it('should execute again after throttle period with rapid calls', () => {
      const component = createComponent();

      for (let i = 0; i < 5; i++) {
        component.throttledFn(`first-${i}`);
      }
      expect(component.callCount).toBe(1);
      expect(component.lastValue).toBe('first-0');

      jest.advanceTimersByTime(300);
      expect(component.callCount).toBe(2);
      expect(component.lastValue).toBe('first-4');

      for (let i = 0; i < 5; i++) {
        component.throttledFn(`second-${i}`);
      }
      expect(component.callCount).toBe(2);

      jest.advanceTimersByTime(300);
      expect(component.callCount).toBe(3);
      expect(component.lastValue).toBe('second-4');
    });
  });

  describe('edges', () => {
    const createEdgeComponent = (edges?: { leading?: boolean; trailing?: boolean }) => {
      @Component({ template: '' })
      class EdgeComponent {
        calls: string[] = [];

        readonly throttledFn = throttleCallback(
          (value: string) => {
            this.calls.push(value);
          },
          300,
          edges
        );
      }

      const fixture = TestBed.createComponent(EdgeComponent);
      fixture.detectChanges();
      return fixture.componentInstance;
    };

    const createTrailingComponent = (trailing?: boolean) => createEdgeComponent({ trailing });

    describe('leading', () => {
      it('should defer the opening call to the end of the interval when disabled', () => {
        const component = createEdgeComponent({ leading: false });

        component.throttledFn('first');
        expect(component.calls).toEqual([]);

        component.throttledFn('last');
        expect(component.calls).toEqual([]);

        jest.advanceTimersByTime(300);
        expect(component.calls).toEqual(['last']);
      });

      it('should still deliver a single isolated call when disabled', () => {
        const component = createEdgeComponent({ leading: false });

        component.throttledFn('only');

        jest.advanceTimersByTime(10_000);

        expect(component.calls).toEqual(['only']);
      });

      it('should keep emitting once per interval under sustained calls when disabled', () => {
        const component = createEdgeComponent({ leading: false });

        // unlike a debounce, a continuous stream must not starve the callback
        for (let tick = 1; tick <= 3; tick++) {
          component.throttledFn(`tick-${tick}`);
          jest.advanceTimersByTime(300);
        }

        expect(component.calls).toEqual(['tick-1', 'tick-2', 'tick-3']);
      });

      it('should invoke only on the opening call when trailing is also disabled', () => {
        const component = createEdgeComponent({ leading: true, trailing: false });

        component.throttledFn('first');
        component.throttledFn('dropped');

        jest.advanceTimersByTime(10_000);

        expect(component.calls).toEqual(['first']);
      });

      it('should never invoke the callback when both edges are disabled', () => {
        const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

        const component = createEdgeComponent({ leading: false, trailing: false });

        component.throttledFn('first');
        component.throttledFn('second');

        jest.advanceTimersByTime(10_000);

        expect(component.calls).toEqual([]);
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('never run'));

        warn.mockRestore();
      });
    });

    it('should deliver the last call of a burst by default', () => {
      const component = createTrailingComponent();

      component.throttledFn('first');
      component.throttledFn('last');

      // the interval ends and nothing else ever happens
      jest.advanceTimersByTime(10_000);

      expect(component.calls).toEqual(['first', 'last']);
    });

    it('should not invoke a trailing call when nothing was dropped', () => {
      const component = createTrailingComponent();

      component.throttledFn('only');

      jest.advanceTimersByTime(10_000);

      expect(component.calls).toEqual(['only']);
    });

    it('should drop calls made during the interval when disabled', () => {
      const component = createTrailingComponent(false);

      component.throttledFn('first');
      component.throttledFn('last');

      jest.advanceTimersByTime(10_000);

      expect(component.calls).toEqual(['first']);
    });

    it('should open a fresh interval right after a trailing call', () => {
      const component = createTrailingComponent();

      component.throttledFn('first');
      component.throttledFn('second');

      jest.advanceTimersByTime(300);
      expect(component.calls).toEqual(['first', 'second']);

      // the trailing call owns the next interval, so this one is queued rather than immediate
      component.throttledFn('third');
      expect(component.calls).toEqual(['first', 'second']);

      jest.advanceTimersByTime(300);
      expect(component.calls).toEqual(['first', 'second', 'third']);
    });

    it('should not run a queued trailing call after the component is destroyed', () => {
      @Component({ template: '' })
      class DestroyComponent {
        calls: string[] = [];

        readonly throttledFn = throttleCallback((value: string) => {
          this.calls.push(value);
        }, 300);
      }

      const fixture = TestBed.createComponent(DestroyComponent);
      fixture.detectChanges();
      const component = fixture.componentInstance;

      component.throttledFn('first');
      component.throttledFn('queued');
      expect(component.calls).toEqual(['first']);

      fixture.destroy();

      jest.advanceTimersByTime(10_000);

      expect(component.calls).toEqual(['first']);
    });

    it('should read the wait signal again for each interval', () => {
      @Component({ template: '' })
      class ReactiveWaitComponent {
        readonly wait = signal(300);
        calls: string[] = [];

        readonly throttledFn = throttleCallback((value: string) => {
          this.calls.push(value);
        }, this.wait);
      }

      const fixture = TestBed.createComponent(ReactiveWaitComponent);
      fixture.detectChanges();
      const component = fixture.componentInstance;

      component.throttledFn('first');
      component.throttledFn('second');

      jest.advanceTimersByTime(300);
      expect(component.calls).toEqual(['first', 'second']);

      // drain the interval opened by the trailing call, then widen the wait
      jest.advanceTimersByTime(300);
      component.wait.set(1000);

      component.throttledFn('third');
      component.throttledFn('fourth');
      expect(component.calls).toEqual(['first', 'second', 'third']);

      jest.advanceTimersByTime(999);
      expect(component.calls).toEqual(['first', 'second', 'third']);

      jest.advanceTimersByTime(1);
      expect(component.calls).toEqual(['first', 'second', 'third', 'fourth']);
    });
  });
});

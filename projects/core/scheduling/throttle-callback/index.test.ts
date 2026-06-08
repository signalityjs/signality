import { vi } from 'vitest';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { throttleCallback } from './index';

describe(throttleCallback.name, () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
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

  it('should allow execution after wait time', () => {
    const component = createComponent();

    component.throttledFn('first');
    expect(component.callCount).toBe(1);

    vi.advanceTimersByTime(299);
    component.throttledFn('second');
    expect(component.callCount).toBe(1);

    vi.advanceTimersByTime(1);
    component.throttledFn('third');
    expect(component.callCount).toBe(2);
    expect(component.lastValue).toBe('third');
  });

  it('should handle multiple throttle cycles', () => {
    const component = createComponent();

    component.throttledFn('first');
    expect(component.callCount).toBe(1);

    vi.advanceTimersByTime(300);
    component.throttledFn('second');
    expect(component.callCount).toBe(2);

    vi.advanceTimersByTime(300);
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

      vi.advanceTimersByTime(300);

      for (let i = 0; i < 5; i++) {
        component.throttledFn(`second-${i}`);
      }
      expect(component.callCount).toBe(2);
      expect(component.lastValue).toBe('second-0');
    });
  });
});

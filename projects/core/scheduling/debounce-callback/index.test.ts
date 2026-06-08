import { vi } from 'vitest';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { debounceCallback } from './index';

describe(debounceCallback.name, () => {
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

    readonly debouncedFn = debounceCallback((value: string) => {
      this.callCount++;
      this.lastValue = value;
    }, 300);
  }

  const createComponent = () => {
    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    return fixture.componentInstance;
  };

  it('should not execute callback immediately', () => {
    const component = createComponent();

    component.debouncedFn('first');

    expect(component.callCount).toBe(0);
  });

  it('should execute callback after wait time', () => {
    const component = createComponent();

    component.debouncedFn('first');
    expect(component.callCount).toBe(0);

    vi.advanceTimersByTime(300);

    expect(component.callCount).toBe(1);
    expect(component.lastValue).toBe('first');
  });

  it('should reset timer on subsequent calls', () => {
    const component = createComponent();

    component.debouncedFn('first');
    vi.advanceTimersByTime(100);

    component.debouncedFn('second');
    vi.advanceTimersByTime(100);

    component.debouncedFn('third');
    vi.advanceTimersByTime(299);

    expect(component.callCount).toBe(0);

    vi.advanceTimersByTime(1);

    expect(component.callCount).toBe(1);
    expect(component.lastValue).toBe('third');
  });

  it('should only execute last call after rapid calls', () => {
    const component = createComponent();

    for (let i = 0; i < 10; i++) {
      component.debouncedFn(`call-${i}`);
      vi.advanceTimersByTime(50);
    }

    expect(component.callCount).toBe(0);

    vi.advanceTimersByTime(300);

    expect(component.callCount).toBe(1);
    expect(component.lastValue).toBe('call-9');
  });

  it('should handle multiple debounce cycles', () => {
    const component = createComponent();

    component.debouncedFn('first');
    vi.advanceTimersByTime(300);
    expect(component.callCount).toBe(1);
    expect(component.lastValue).toBe('first');

    component.debouncedFn('second');
    vi.advanceTimersByTime(300);
    expect(component.callCount).toBe(2);
    expect(component.lastValue).toBe('second');

    component.debouncedFn('third');
    vi.advanceTimersByTime(300);
    expect(component.callCount).toBe(3);
    expect(component.lastValue).toBe('third');
  });

  it('should preserve function arguments', () => {
    @Component({ template: '' })
    class MultiArgComponent {
      result: any;

      readonly debounced = debounceCallback((a: number, b: string, c: boolean) => {
        this.result = { a, b, c };
      }, 300);
    }

    const fixture = TestBed.createComponent(MultiArgComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component.debounced(42, 'test', true);
    vi.advanceTimersByTime(300);

    expect(component.result).toEqual({ a: 42, b: 'test', c: true });
  });

  it('should preserve this context', () => {
    @Component({ template: '' })
    class ContextComponent {
      value = 'component';
      capturedThis: any;

      readonly debouncedFn = debounceCallback(function (this: ContextComponent) {
        this.capturedThis = this;
      }, 300);
    }

    const fixture = TestBed.createComponent(ContextComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component.debouncedFn();
    vi.advanceTimersByTime(300);

    expect(component.capturedThis).toBe(component);
    expect(component.capturedThis.value).toBe('component');
  });

  describe('rapid calls within wait period', () => {
    it('should cancel previous timer and start new one', () => {
      const component = createComponent();

      component.debouncedFn('first');
      vi.advanceTimersByTime(250);
      expect(component.callCount).toBe(0);

      component.debouncedFn('second');
      vi.advanceTimersByTime(250);
      expect(component.callCount).toBe(0);

      component.debouncedFn('third');
      vi.advanceTimersByTime(300);

      expect(component.callCount).toBe(1);
      expect(component.lastValue).toBe('third');
    });

    it('should not execute until idle period', () => {
      const component = createComponent();

      for (let i = 0; i < 5; i++) {
        component.debouncedFn(`value-${i}`);
        vi.advanceTimersByTime(100);
      }

      expect(component.callCount).toBe(0);

      vi.advanceTimersByTime(300);

      expect(component.callCount).toBe(1);
      expect(component.lastValue).toBe('value-4');
    });
  });
});

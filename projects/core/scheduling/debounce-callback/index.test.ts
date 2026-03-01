import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { debounceCallback } from './index';

describe(debounceCallback.name, () => {
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

    jest.advanceTimersByTime(300);

    expect(component.callCount).toBe(1);
    expect(component.lastValue).toBe('first');
  });

  it('should reset timer on subsequent calls', () => {
    const component = createComponent();

    component.debouncedFn('first');
    jest.advanceTimersByTime(100);

    component.debouncedFn('second');
    jest.advanceTimersByTime(100);

    component.debouncedFn('third');
    jest.advanceTimersByTime(299);

    expect(component.callCount).toBe(0);

    jest.advanceTimersByTime(1);

    expect(component.callCount).toBe(1);
    expect(component.lastValue).toBe('third');
  });

  it('should only execute last call after rapid calls', () => {
    const component = createComponent();

    for (let i = 0; i < 10; i++) {
      component.debouncedFn(`call-${i}`);
      jest.advanceTimersByTime(50);
    }

    expect(component.callCount).toBe(0);

    jest.advanceTimersByTime(300);

    expect(component.callCount).toBe(1);
    expect(component.lastValue).toBe('call-9');
  });

  it('should handle multiple debounce cycles', () => {
    const component = createComponent();

    component.debouncedFn('first');
    jest.advanceTimersByTime(300);
    expect(component.callCount).toBe(1);
    expect(component.lastValue).toBe('first');

    component.debouncedFn('second');
    jest.advanceTimersByTime(300);
    expect(component.callCount).toBe(2);
    expect(component.lastValue).toBe('second');

    component.debouncedFn('third');
    jest.advanceTimersByTime(300);
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
    jest.advanceTimersByTime(300);

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
    jest.advanceTimersByTime(300);

    expect(component.capturedThis).toBe(component);
    expect(component.capturedThis.value).toBe('component');
  });

  describe('rapid calls within wait period', () => {
    it('should cancel previous timer and start new one', () => {
      const component = createComponent();

      component.debouncedFn('first');
      jest.advanceTimersByTime(250);
      expect(component.callCount).toBe(0);

      component.debouncedFn('second');
      jest.advanceTimersByTime(250);
      expect(component.callCount).toBe(0);

      component.debouncedFn('third');
      jest.advanceTimersByTime(300);

      expect(component.callCount).toBe(1);
      expect(component.lastValue).toBe('third');
    });

    it('should not execute until idle period', () => {
      const component = createComponent();

      for (let i = 0; i < 5; i++) {
        component.debouncedFn(`value-${i}`);
        jest.advanceTimersByTime(100);
      }

      expect(component.callCount).toBe(0);

      jest.advanceTimersByTime(300);

      expect(component.callCount).toBe(1);
      expect(component.lastValue).toBe('value-4');
    });
  });
});

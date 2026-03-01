import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { watcher } from './index';

describe(watcher.name, () => {
  describe('single signal', () => {
    @Component({ template: '' })
    class TestComponent {
      readonly count = signal(0);

      callCount = 0;
      currentValue: any;
      previousValue: any;

      constructor() {
        watcher(this.count, (curr, prev) => {
          this.callCount++;
          this.currentValue = curr;
          this.previousValue = prev;
        });
      }
    }

    const createComponent = () => {
      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      return fixture.componentInstance;
    };

    it('should not execute on initial value', () => {
      const component = createComponent();

      expect(component.callCount).toBe(0);
    });

    it('should execute when signal changes', () => {
      const component = createComponent();

      component.count.set(1);
      TestBed.tick();

      expect(component.callCount).toBe(1);
      expect(component.currentValue).toBe(1);
      expect(component.previousValue).toBe(0);
    });

    it('should track multiple changes', () => {
      const component = createComponent();

      component.count.set(1);
      TestBed.tick();
      expect(component.callCount).toBe(1);
      expect(component.currentValue).toBe(1);
      expect(component.previousValue).toBe(0);

      component.count.set(2);
      TestBed.tick();
      expect(component.callCount).toBe(2);
      expect(component.currentValue).toBe(2);
      expect(component.previousValue).toBe(1);

      component.count.set(3);
      TestBed.tick();
      expect(component.callCount).toBe(3);
      expect(component.currentValue).toBe(3);
      expect(component.previousValue).toBe(2);
    });
  });

  describe('multiple signals', () => {
    @Component({ template: '' })
    class TestComponent {
      readonly name = signal('John');
      readonly age = signal(25);

      callCount = 0;
      currentValues: any;
      previousValues: any;

      constructor() {
        watcher([this.name, this.age], (curr, prev) => {
          this.callCount++;
          this.currentValues = curr;
          this.previousValues = prev;
        });
      }
    }

    const createComponent = () => {
      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      return fixture.componentInstance;
    };

    it('should not execute on initial values', () => {
      const component = createComponent();

      expect(component.callCount).toBe(0);
    });

    it('should execute when first signal changes', () => {
      const component = createComponent();

      component.name.set('Jane');
      TestBed.tick();

      expect(component.callCount).toBe(1);
      expect(component.currentValues).toEqual(['Jane', 25]);
      expect(component.previousValues).toEqual(['John', 25]);
    });

    it('should execute when second signal changes', () => {
      const component = createComponent();

      component.age.set(30);
      TestBed.tick();

      expect(component.callCount).toBe(1);
      expect(component.currentValues).toEqual(['John', 30]);
      expect(component.previousValues).toEqual(['John', 25]);
    });

    it('should execute when both signals change', () => {
      const component = createComponent();

      component.name.set('Jane');
      TestBed.tick();
      expect(component.callCount).toBe(1);

      component.age.set(30);
      TestBed.tick();
      expect(component.callCount).toBe(2);
      expect(component.currentValues).toEqual(['Jane', 30]);
      expect(component.previousValues).toEqual(['Jane', 25]);
    });

    it('should track multiple changes correctly', () => {
      const component = createComponent();

      component.name.set('Jane');
      TestBed.tick();
      expect(component.previousValues).toEqual(['John', 25]);
      expect(component.currentValues).toEqual(['Jane', 25]);

      component.age.set(30);
      TestBed.tick();
      expect(component.previousValues).toEqual(['Jane', 25]);
      expect(component.currentValues).toEqual(['Jane', 30]);

      component.name.set('Bob');
      TestBed.tick();
      expect(component.previousValues).toEqual(['Jane', 30]);
      expect(component.currentValues).toEqual(['Bob', 30]);
    });
  });

  describe('with once option', () => {
    @Component({ template: '' })
    class TestComponent {
      readonly count = signal(0);

      callCount = 0;

      constructor() {
        watcher(
          this.count,
          () => {
            this.callCount++;
          },
          { once: true }
        );
      }
    }

    const createComponent = () => {
      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      return fixture.componentInstance;
    };

    it('should execute only once', () => {
      const component = createComponent();

      component.count.set(1);
      TestBed.tick();
      expect(component.callCount).toBe(1);

      component.count.set(2);
      TestBed.tick();
      expect(component.callCount).toBe(1);

      component.count.set(3);
      TestBed.tick();
      expect(component.callCount).toBe(1);
    });
  });

  describe('with onCleanup', () => {
    @Component({ template: '' })
    class TestComponent {
      readonly count = signal(0);
      cleanupCalls = 0;

      constructor() {
        watcher(this.count, (curr, prev, onCleanup) => {
          onCleanup(() => {
            this.cleanupCalls++;
          });
        });
      }
    }

    const createComponent = () => {
      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      return fixture.componentInstance;
    };

    it('should call cleanup on next change', () => {
      const component = createComponent();

      component.count.set(1);
      TestBed.tick();
      expect(component.cleanupCalls).toBe(0);

      component.count.set(2);
      TestBed.tick();
      expect(component.cleanupCalls).toBe(1);

      component.count.set(3);
      TestBed.tick();
      expect(component.cleanupCalls).toBe(2);
    });
  });

  describe('manual destroy', () => {
    @Component({ template: '' })
    class TestComponent {
      readonly count = signal(0);
      callCount = 0;
      watcherRef = watcher(this.count, () => {
        this.callCount++;
      });
    }

    const createComponent = () => {
      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      return fixture.componentInstance;
    };

    it('should stop watching after destroy', () => {
      const component = createComponent();

      component.count.set(1);
      TestBed.tick();
      expect(component.callCount).toBe(1);

      component.watcherRef.destroy();

      component.count.set(2);
      TestBed.tick();
      expect(component.callCount).toBe(1);

      component.count.set(3);
      TestBed.tick();
      expect(component.callCount).toBe(1);
    });
  });

  describe('object and array signals', () => {
    @Component({ template: '' })
    class TestComponent {
      readonly user = signal({ name: 'John', age: 25 });
      callCount = 0;
      currentValue: any;
      previousValue: any;

      constructor() {
        watcher(this.user, (curr, prev) => {
          this.callCount++;
          this.currentValue = curr;
          this.previousValue = prev;
        });
      }
    }

    const createComponent = () => {
      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      return fixture.componentInstance;
    };

    it('should track object changes', () => {
      const component = createComponent();

      component.user.set({ name: 'Jane', age: 30 });
      TestBed.tick();

      expect(component.callCount).toBe(1);
      expect(component.currentValue).toEqual({ name: 'Jane', age: 30 });
      expect(component.previousValue).toEqual({ name: 'John', age: 25 });
    });

    it('should track update method on objects', () => {
      const component = createComponent();

      component.user.update(u => ({ ...u, age: 26 }));
      TestBed.tick();

      expect(component.callCount).toBe(1);
      expect(component.currentValue).toEqual({ name: 'John', age: 26 });
      expect(component.previousValue).toEqual({ name: 'John', age: 25 });
    });
  });
});

import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NavigationCancel, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { routerListener } from './index';

describe(routerListener.name, () => {
  let events: Subject<any>;
  let mockRouter: { events: Subject<any> };

  beforeEach(() => {
    events = new Subject();
    mockRouter = { events: events };

    TestBed.configureTestingModule({
      providers: [{ provide: Router, useValue: mockRouter }],
    });
  });

  @Component({ template: '{{ isLoading() }}' })
  class TestComponent {
    readonly isLoading = signal(false);

    constructor() {
      routerListener('navigationstart', () => {
        this.isLoading.set(true);
      });

      routerListener('navigationend', () => {
        this.isLoading.set(false);
      });
    }
  }

  const createComponent = () => {
    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    return fixture.componentInstance;
  };

  it('should handle navigationstart event', () => {
    const component = createComponent();
    expect(component.isLoading()).toBe(false);

    events.next(new NavigationStart(1, '/test'));
    expect(component.isLoading()).toBe(true);
  });

  it('should handle navigationend event', () => {
    const component = createComponent();

    events.next(new NavigationStart(1, '/test'));
    expect(component.isLoading()).toBe(true);

    events.next(new NavigationEnd(1, '/test', '/test'));
    expect(component.isLoading()).toBe(false);
  });

  it('should handle multiple events', () => {
    const component = createComponent();

    events.next(new NavigationStart(1, '/page1'));
    expect(component.isLoading()).toBe(true);

    events.next(new NavigationEnd(1, '/page1', '/page1'));
    expect(component.isLoading()).toBe(false);

    events.next(new NavigationStart(2, '/page2'));
    expect(component.isLoading()).toBe(true);

    events.next(new NavigationEnd(2, '/page2', '/page2'));
    expect(component.isLoading()).toBe(false);
  });

  describe('with once option', () => {
    @Component({ template: '' })
    class TestWithOnceOption {
      readonly count = signal(0);

      constructor() {
        routerListener('navigationstart', () => this.count.update(c => c + 1), { once: true });
      }
    }

    it('should unsubscribe after first event', () => {
      const fixture = TestBed.createComponent(TestWithOnceOption);
      const component = fixture.componentInstance;
      fixture.detectChanges();

      events.next(new NavigationStart(1, '/test1'));
      expect(component.count()).toBe(1);

      events.next(new NavigationStart(2, '/test2'));
      expect(component.count()).toBe(1);

      events.next(new NavigationStart(3, '/test3'));
      expect(component.count()).toBe(1);
    });
  });

  describe('with multiple events', () => {
    @Component({ template: '' })
    class TestWithMultipleOptions {
      readonly events = signal<string[]>([]);

      constructor() {
        routerListener(['navigationstart', 'navigationend', 'navigationcancel'], event => {
          if (event instanceof NavigationStart) {
            this.events.update(e => [...e, 'start']);
          } else if (event instanceof NavigationEnd) {
            this.events.update(e => [...e, 'end']);
          } else {
            this.events.update(e => [...e, 'cancel']);
          }
        });
      }
    }

    it('should handle multiple event types', () => {
      const fixture = TestBed.createComponent(TestWithMultipleOptions);
      const component = fixture.componentInstance;
      fixture.detectChanges();

      events.next(new NavigationStart(1, '/test'));
      expect(component.events()).toEqual(['start']);

      events.next(new NavigationEnd(1, '/test', '/test'));
      expect(component.events()).toEqual(['start', 'end']);

      events.next(new NavigationStart(2, '/test2'));
      events.next(new NavigationCancel(2, '/test2', 'user cancelled'));
      expect(component.events()).toEqual(['start', 'end', 'start', 'cancel']);
    });
  });

  describe('destroy', () => {
    @Component({ template: '' })
    class DestroyTestComponent {
      readonly count = signal(0);
      readonly listener = routerListener('navigationstart', () => {
        this.count.update(c => c + 1);
      });
    }

    it('should stop listening after destroy', () => {
      const fixture = TestBed.createComponent(DestroyTestComponent);
      const component = fixture.componentInstance;
      fixture.detectChanges();

      events.next(new NavigationStart(1, '/test1'));
      expect(component.count()).toBe(1);

      component.listener.destroy();

      events.next(new NavigationStart(2, '/test2'));
      expect(component.count()).toBe(1);
    });
  });
});

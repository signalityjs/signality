import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { url } from './index';

describe(url.name, () => {
  let events: Subject<any>;
  let mockRouter: { url: string; events: Subject<any> };

  beforeEach(() => {
    events = new Subject();
    mockRouter = { url: '/home', events: events };

    TestBed.configureTestingModule({
      providers: [{ provide: Router, useValue: mockRouter }],
    });

    Object.defineProperty(window, 'location', {
      writable: true,
      value: { origin: 'http://localhost:4200' },
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('relative URL', () => {
    @Component({ template: '{{ currentUrl() }}' })
    class TestComponent {
      readonly currentUrl = url();
    }

    const createComponent = () => {
      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      return fixture.componentInstance;
    };

    it('should return current relative URL', () => {
      const component = createComponent();

      expect(component.currentUrl()).toBe('/home');
    });

    it('should update when navigation ends', () => {
      const component = createComponent();

      expect(component.currentUrl()).toBe('/home');

      mockRouter.url = '/about';
      events.next(new NavigationEnd(1, '/about', '/about'));
      expect(component.currentUrl()).toBe('/about');

      mockRouter.url = '/contact';
      events.next(new NavigationEnd(2, '/contact', '/contact'));
      expect(component.currentUrl()).toBe('/contact');
    });
  });

  describe('absolute URL', () => {
    @Component({ template: '{{ absoluteUrl() }}' })
    class TestComponent {
      readonly absoluteUrl = url({ absolute: true });
    }

    const createComponent = () => {
      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      return fixture.componentInstance;
    };

    it('should return current absolute URL', () => {
      const component = createComponent();

      expect(component.absoluteUrl()).toBe('http://localhost:4200/home');
    });

    it('should update when navigation ends', () => {
      const component = createComponent();

      expect(component.absoluteUrl()).toBe('http://localhost:4200/home');

      mockRouter.url = '/products/123';
      events.next(new NavigationEnd(1, '/products/123', '/products/123'));
      expect(component.absoluteUrl()).toBe('http://localhost:4200/products/123');

      mockRouter.url = '/users?sort=name';
      events.next(new NavigationEnd(2, '/users?sort=name', '/users?sort=name'));
      expect(component.absoluteUrl()).toBe('http://localhost:4200/users?sort=name');
    });
  });

  describe('multiple instances', () => {
    @Component({ template: '' })
    class TestComponent {
      readonly relativeUrl = url();
      readonly absoluteUrl = url({ absolute: true });
    }

    const createComponent = () => {
      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      return fixture.componentInstance;
    };

    it('should handle both relative and absolute URLs', () => {
      const component = createComponent();

      expect(component.relativeUrl()).toBe('/home');
      expect(component.absoluteUrl()).toBe('http://localhost:4200/home');

      mockRouter.url = '/dashboard';
      events.next(new NavigationEnd(1, '/dashboard', '/dashboard'));

      expect(component.relativeUrl()).toBe('/dashboard');
      expect(component.absoluteUrl()).toBe('http://localhost:4200/dashboard');
    });
  });
});

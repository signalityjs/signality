import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { APP_BASE_HREF } from '@angular/common';
import { favicon } from './index';

describe(favicon.name, () => {
  @Component({ template: '' })
  class TestComponent {
    readonly fav = favicon();
  }

  const createComponent = () => {
    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    return fixture.componentInstance;
  };

  it('should return empty string initially', () => {
    const component = createComponent();

    expect(component.fav.current()).toBe('');
    expect(component.fav.original()).toBe('');
  });

  it('should update current when setting favicon', () => {
    const component = createComponent();

    component.fav.set('/favicon.ico');

    expect(component.fav.current()).toBe('/favicon.ico');
  });

  it('should reset to original', () => {
    const component = createComponent();

    component.fav.set('/new-favicon.ico');
    expect(component.fav.current()).toBe('/new-favicon.ico');

    component.fav.reset();
    expect(component.fav.current()).toBe(component.fav.original());
  });

  describe('with baseUrl option', () => {
    @Component({ template: '' })
    class TestComponent {
      readonly fav = favicon({ baseUrl: 'https://example.com' });
    }

    const createComponent = () => {
      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      return fixture.componentInstance;
    };

    it('should prepend baseUrl to path', () => {
      const component = createComponent();

      component.fav.set('/favicon.ico');

      expect(component.fav.current()).toBe('https://example.com/favicon.ico');
    });
  });

  describe('with APP_BASE_HREF provider', () => {
    @Component({ template: '' })
    class TestComponent {
      readonly fav = favicon();
    }

    const createComponent = () => {
      TestBed.configureTestingModule({
        providers: [{ provide: APP_BASE_HREF, useValue: '/app/' }],
      });

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      return fixture.componentInstance;
    };

    it('should use APP_BASE_HREF as baseUrl', () => {
      const component = createComponent();

      component.fav.set('favicon.ico');

      expect(component.fav.current()).toBe('/app/favicon.ico');
    });
  });
});

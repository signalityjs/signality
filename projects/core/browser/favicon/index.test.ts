import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { APP_BASE_HREF } from '@angular/common';
import { favicon } from './index';

describe(favicon.name, () => {
  let existingLink: HTMLLinkElement | null;

  beforeEach(() => {
    document.querySelectorAll('link[rel*="icon"]').forEach(link => link.remove());
    existingLink = null;
  });

  afterEach(() => {
    document.querySelectorAll('link[rel*="icon"]').forEach(link => link.remove());
    if (existingLink) {
      document.head.appendChild(existingLink);
    }
  });

  describe('without existing favicon', () => {
    @Component({ template: '' })
    class TestComponent {
      readonly fav = favicon();
    }

    const createComponent = () => {
      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      return fixture.componentInstance;
    };

    it('should create favicon link element if not exists', () => {
      createComponent();

      const link = document.querySelector('link[rel*="icon"]');
      expect(link).toBeTruthy();
    });

    it('should set current and original to empty string initially', () => {
      const component = createComponent();

      expect(component.fav.current()).toBe('');
      expect(component.fav.original()).toBe('');
    });

    it('should set favicon url', () => {
      const component = createComponent();

      component.fav.set('/favicon.ico');

      const link = document.querySelector<HTMLLinkElement>('link[rel*="icon"]');
      expect(link?.href).toBe('http://localhost/favicon.ico');
      expect(component.fav.current()).toBe('/favicon.ico');
    });

    it('should reset to original favicon', () => {
      const component = createComponent();

      component.fav.set('/new-favicon.ico');
      expect(component.fav.current()).toBe('/new-favicon.ico');

      component.fav.reset();
      expect(component.fav.current()).toBe(component.fav.original());
    });
  });

  describe('with existing favicon', () => {
    beforeEach(() => {
      existingLink = document.createElement('link');
      existingLink.rel = 'icon';
      existingLink.href = '/original.ico';
      document.head.appendChild(existingLink);
    });

    @Component({ template: '' })
    class TestComponent {
      readonly fav = favicon();
    }

    const createComponent = () => {
      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      return fixture.componentInstance;
    };

    it('should use existing favicon link element', () => {
      createComponent();

      const links = document.querySelectorAll('link[rel*="icon"]');
      expect(links.length).toBe(1);
    });

    it('should preserve original favicon url', () => {
      const component = createComponent();

      expect(component.fav.original()).toBe('http://localhost/original.ico');
    });

    it('should update existing favicon', () => {
      const component = createComponent();

      component.fav.set('/new-favicon.ico');

      const link = document.querySelector<HTMLLinkElement>('link[rel*="icon"]');
      expect(link?.href).toBe('http://localhost/new-favicon.ico');
    });
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

    it('should prepend baseUrl to favicon path', () => {
      const component = createComponent();

      component.fav.set('/favicon.ico');

      const link = document.querySelector<HTMLLinkElement>('link[rel*="icon"]');
      expect(link?.href).toBe('https://example.com/favicon.ico');
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

      const link = document.querySelector<HTMLLinkElement>('link[rel*="icon"]');
      expect(link?.href).toBe('http://localhost/app/favicon.ico');
      expect(component.fav.current()).toBe('/app/favicon.ico');
    });
  });
});

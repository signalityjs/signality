import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { queryParams, QueryParamsValidator } from './index';

describe(queryParams.name, () => {
  @Component({ template: '' })
  class RouteComponent {}

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: '**', component: RouteComponent }])],
    });
  });

  describe('without schema', () => {
    @Component({ template: '{{ searchParams().q }} {{ searchParams().sort }}' })
    class TestComponent {
      readonly searchParams = queryParams<{ q?: string; sort?: string }>();
    }

    const createComponent = () => {
      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      return fixture;
    };

    it('should read the initial query params from the snapshot', async () => {
      const router = TestBed.inject(Router);
      await router.navigate([], { queryParams: { q: 'angular', sort: 'name' } });

      const component = createComponent().componentInstance;

      expect(component.searchParams()).toEqual({ q: 'angular', sort: 'name' });
    });

    it('should update when query params change', async () => {
      const router = TestBed.inject(Router);
      const component = createComponent().componentInstance;

      expect(component.searchParams()).toEqual({});

      await router.navigate([], { queryParams: { q: 'angular', sort: 'name' } });
      expect(component.searchParams()).toEqual({ q: 'angular', sort: 'name' });

      await router.navigate([], { queryParams: { q: 'react', sort: 'date' } });
      expect(component.searchParams()).toEqual({ q: 'react', sort: 'date' });

      await router.navigate([], { queryParams: {} });
      expect(component.searchParams()).toEqual({});
    });

    it('should write new query params', async () => {
      const router = TestBed.inject(Router);
      const fixture = createComponent();
      const component = fixture.componentInstance;

      component.searchParams.set({ q: 'angular', sort: 'name' });
      await fixture.whenStable();
      expect(router.url).toBe('/?q=angular&sort=name');
      expect(component.searchParams()).toEqual({ q: 'angular', sort: 'name' });

      component.searchParams.update(params => ({ ...params, sort: 'date' }));
      await fixture.whenStable();
      expect(router.url).toBe('/?q=angular&sort=date');
      expect(component.searchParams()).toEqual({ q: 'angular', sort: 'date' });
    });

    it('should replace the existing query params on write', async () => {
      const router = TestBed.inject(Router);
      const fixture = createComponent();
      const component = fixture.componentInstance;

      component.searchParams.set({ q: 'angular', sort: 'name' });
      await fixture.whenStable();

      component.searchParams.set({ q: 'react' });
      await fixture.whenStable();
      expect(router.url).toBe('/?q=react');

      component.searchParams.set({});
      await fixture.whenStable();
      expect(router.url).toBe('/');
    });

    it('should preserve the fragment on write', async () => {
      const router = TestBed.inject(Router);
      const fixture = createComponent();

      await router.navigate([], { fragment: 'details' });

      fixture.componentInstance.searchParams.set({ q: 'angular' });
      await fixture.whenStable();
      expect(router.url).toBe('/?q=angular#details');
    });

    it('should keep the current params when navigation fails', async () => {
      const router = TestBed.inject(Router);
      await router.navigate([], { queryParams: { q: 'angular', sort: 'name' } });
      const fixture = createComponent();
      const component = fixture.componentInstance;

      jest.spyOn(router, 'navigate').mockResolvedValue(false);

      component.searchParams.set({ q: 'react' });
      await fixture.whenStable();
      expect(component.searchParams()).toEqual({ q: 'angular', sort: 'name' });
    });

    it('should replace the history entry with `{ replaceUrl: true }`', async () => {
      @Component({ template: '' })
      class ReplaceUrlComponent {
        readonly searchParams = queryParams<{ page?: string }>({ replaceUrl: true });
      }

      const router = TestBed.inject(Router);
      const navigate = jest.spyOn(router, 'navigate');
      const fixture = TestBed.createComponent(ReplaceUrlComponent);
      fixture.detectChanges();

      fixture.componentInstance.searchParams.set({ page: '2' });
      await fixture.whenStable();

      expect(navigate).toHaveBeenCalledWith([], expect.objectContaining({ replaceUrl: true }));
    });
  });

  describe('with schema', () => {
    const mockSchema = { parse: jest.fn() };

    @Component({ template: '' })
    class TestComponent {
      readonly params = queryParams({ schema: mockSchema });
    }

    beforeEach(() => {
      mockSchema.parse.mockReset();
    });

    const createComponent = () => {
      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      return fixture;
    };

    it('should validate initial query params', () => {
      mockSchema.parse.mockReturnValue({ q: 'angular', page: 1 });
      const component = createComponent().componentInstance;

      expect(component.params.isValid()).toBe(true);
      expect(component.params.error()).toBeNull();
      expect(component.params.value()).toEqual({ q: 'angular', page: 1 });
    });

    it('should handle validation errors on initial params', () => {
      const error = new Error('Validation failed');
      mockSchema.parse.mockImplementation(() => {
        throw error;
      });
      const component = createComponent().componentInstance;

      expect(component.params.isValid()).toBe(false);
      expect(component.params.error()).toBe(error);
      expect(() => component.params.value()).toThrow(error);
    });

    it('should validate query params on change', async () => {
      mockSchema.parse.mockReturnValue({ q: 'angular', page: 1 });
      const router = TestBed.inject(Router);
      const component = createComponent().componentInstance;

      expect(component.params.isValid()).toBe(true);

      mockSchema.parse.mockReturnValue({ q: 'react', page: 2 });
      await router.navigate([], { queryParams: { q: 'react', page: '2' } });

      expect(component.params.isValid()).toBe(true);
      expect(component.params.value()).toEqual({ q: 'react', page: 2 });
      expect(mockSchema.parse).toHaveBeenLastCalledWith({ q: 'react', page: '2' });
    });

    it('should handle validation errors on change', async () => {
      mockSchema.parse.mockReturnValue({ q: 'angular', page: 1 });
      const router = TestBed.inject(Router);
      const component = createComponent().componentInstance;

      expect(component.params.isValid()).toBe(true);

      const error = new Error('Invalid page number');
      mockSchema.parse.mockImplementation(() => {
        throw error;
      });
      await router.navigate([], { queryParams: { q: 'react', page: 'invalid' } });

      expect(component.params.isValid()).toBe(false);
      expect(component.params.error()).toBe(error);
      expect(() => component.params.value()).toThrow(error);
    });

    it('should recover from validation error', async () => {
      mockSchema.parse.mockReturnValue({ q: 'angular', page: 1 });
      const router = TestBed.inject(Router);
      const component = createComponent().componentInstance;

      const error = new Error('Invalid');
      mockSchema.parse.mockImplementation(() => {
        throw error;
      });
      await router.navigate([], { queryParams: { q: '', page: '-1' } });

      expect(component.params.isValid()).toBe(false);

      mockSchema.parse.mockReturnValue({ q: 'vue', page: 3 });
      await router.navigate([], { queryParams: { q: 'vue', page: '3' } });

      expect(component.params.isValid()).toBe(true);
      expect(component.params.error()).toBeNull();
      expect(component.params.value()).toEqual({ q: 'vue', page: 3 });
    });

    it('should write parsed values as query params', async () => {
      mockSchema.parse.mockReturnValue({ q: 'angular', page: 1 });
      const router = TestBed.inject(Router);
      const fixture = createComponent();
      const component = fixture.componentInstance;

      mockSchema.parse.mockReturnValue({ q: 'react', page: 2 });
      component.params.value.set({ q: 'react', page: 2 });
      await fixture.whenStable();

      expect(router.url).toBe('/?q=react&page=2');
      expect(component.params.value()).toEqual({ q: 'react', page: 2 });
    });

    it('should stay writable while the params are invalid', async () => {
      const error = new Error('Invalid page number');
      mockSchema.parse.mockImplementation(() => {
        throw error;
      });
      const router = TestBed.inject(Router);
      const fixture = createComponent();
      const component = fixture.componentInstance;

      expect(component.params.isValid()).toBe(false);
      expect(() => component.params.value()).toThrow(error);

      mockSchema.parse.mockReturnValue({ page: 1 });
      expect(() => component.params.value.set({ page: 1 })).not.toThrow();
      await fixture.whenStable();

      expect(router.url).toBe('/?page=1');
      expect(component.params.isValid()).toBe(true);
      expect(component.params.value()).toEqual({ page: 1 });
    });
  });

  describe('with a custom validator', () => {
    const pageSchema: QueryParamsValidator<{ page: number }> = {
      parse: data => {
        const page = Number((data as { page?: string }).page ?? '1');

        if (!Number.isInteger(page) || page < 1) {
          throw new Error('`page` must be a positive integer');
        }

        return { page };
      },
    };

    @Component({ template: '' })
    class TestComponent {
      readonly rawParams = queryParams<{ page?: string }>();
      readonly params = queryParams({ schema: pageSchema });
    }

    const createComponent = () => {
      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      return fixture;
    };

    it('should reflect params of a router navigation', async () => {
      const router = TestBed.inject(Router);
      const component = createComponent().componentInstance;

      await router.navigate([], { queryParams: { page: '3' } });

      expect(component.rawParams()).toEqual({ page: '3' });
      expect(component.params.value()).toEqual({ page: 3 });
    });

    it('should navigate and stay in sync when written', async () => {
      const router = TestBed.inject(Router);
      const fixture = createComponent();
      const component = fixture.componentInstance;

      component.params.value.set({ page: 5 });
      await fixture.whenStable();

      expect(router.url).toBe('/?page=5');
      expect(component.rawParams()).toEqual({ page: '5' });
      expect(component.params.value()).toEqual({ page: 5 });
    });

    it('should stay writable with a custom `equal` while the params are invalid', async () => {
      @Component({ template: '' })
      class EqualComponent {
        readonly params = queryParams({
          schema: pageSchema,
          equal: (a, b) => a.page === b.page,
        });
      }

      const router = TestBed.inject(Router);
      const fixture = TestBed.createComponent(EqualComponent);
      fixture.detectChanges();

      await router.navigate([], { queryParams: { page: '0' } });
      expect(fixture.componentInstance.params.isValid()).toBe(false);

      fixture.componentInstance.params.value.set({ page: 4 });
      await fixture.whenStable();

      expect(router.url).toBe('/?page=4');
      expect(fixture.componentInstance.params.value()).toEqual({ page: 4 });
    });

    it('should recover from an invalid URL by writing valid params', async () => {
      const router = TestBed.inject(Router);
      const fixture = createComponent();
      const component = fixture.componentInstance;

      await router.navigate([], { queryParams: { page: '0' } });
      expect(component.params.isValid()).toBe(false);
      expect(component.params.error()).toBeInstanceOf(Error);

      component.params.value.set({ page: 2 });
      await fixture.whenStable();

      expect(router.url).toBe('/?page=2');
      expect(component.params.isValid()).toBe(true);
      expect(component.params.error()).toBeNull();
      expect(component.params.value()).toEqual({ page: 2 });
    });
  });
});

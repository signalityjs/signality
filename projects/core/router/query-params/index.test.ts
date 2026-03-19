import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Params } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { queryParams } from './index';

describe(queryParams.name, () => {
  let queryParamsState: BehaviorSubject<Params>;

  beforeEach(() => {
    queryParamsState = new BehaviorSubject<Params>({});

    TestBed.configureTestingModule({
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: queryParamsState.asObservable(),
            snapshot: { queryParams: queryParamsState.getValue() },
          },
        },
      ],
    });
  });

  describe('without schema', () => {
    @Component({ template: '{{ searchParams().q }} {{ searchParams().sort }}' })
    class TestComponent {
      readonly searchParams = queryParams<{ q: string; sort: string }>();
    }

    const createComponent = () => {
      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      return fixture.componentInstance;
    };

    it('should update when query params change', () => {
      queryParamsState.next({ q: 'angular', sort: 'name' });
      const component = createComponent();

      expect(component.searchParams()).toEqual({ q: 'angular', sort: 'name' });

      queryParamsState.next({ q: 'react', sort: 'date' });
      expect(component.searchParams()).toEqual({ q: 'react', sort: 'date' });

      queryParamsState.next({ q: 'vue', sort: 'popularity' });
      expect(component.searchParams()).toEqual({ q: 'vue', sort: 'popularity' });

      queryParamsState.next({});
      expect(component.searchParams()).toEqual({});
    });
  });

  describe('with schema', () => {
    const mockSchema = { parse: jest.fn() };

    beforeEach(() => {
      mockSchema.parse.mockClear();
    });

    @Component({ template: '' })
    class TestComponent {
      readonly params = queryParams({ schema: mockSchema });
    }

    const createComponent = () => {
      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      return fixture.componentInstance;
    };

    it('should validate initial query params', () => {
      mockSchema.parse.mockReturnValue({ q: 'angular', page: 1 });
      const component = createComponent();

      expect(component.params.isValid()).toBe(true);
      expect(component.params.error()).toBeNull();
      expect(component.params.value()).toEqual({ q: 'angular', page: 1 });
    });

    it('should handle validation errors on initial params', () => {
      const error = new Error('Validation failed');
      mockSchema.parse.mockImplementation(() => {
        throw error;
      });
      const component = createComponent();

      expect(component.params.isValid()).toBe(false);
      expect(component.params.error()).toBe(error);
      expect(() => component.params.value()).toThrow(error);
    });

    it('should validate query params on change', () => {
      mockSchema.parse.mockReturnValue({ q: 'angular', page: 1 });
      const component = createComponent();

      expect(component.params.isValid()).toBe(true);

      mockSchema.parse.mockReturnValue({ q: 'react', page: 2 });
      queryParamsState.next({ q: 'react', page: '2' });

      expect(component.params.isValid()).toBe(true);
      expect(component.params.value()).toEqual({ q: 'react', page: 2 });
    });

    it('should handle validation errors on change', () => {
      mockSchema.parse.mockReturnValue({ q: 'angular', page: 1 });
      const component = createComponent();

      expect(component.params.isValid()).toBe(true);

      const error = new Error('Invalid page number');
      mockSchema.parse.mockImplementation(() => {
        throw error;
      });
      queryParamsState.next({ q: 'react', page: 'invalid' });

      expect(component.params.isValid()).toBe(false);
      expect(component.params.error()).toBe(error);
      expect(() => component.params.value()).toThrow(error);
    });

    it('should recover from validation error', () => {
      mockSchema.parse.mockReturnValue({ q: 'angular', page: 1 });
      const component = createComponent();

      const error = new Error('Invalid');
      mockSchema.parse.mockImplementation(() => {
        throw error;
      });
      queryParamsState.next({ q: '', page: '-1' });

      expect(component.params.isValid()).toBe(false);

      mockSchema.parse.mockReturnValue({ q: 'vue', page: 3 });
      queryParamsState.next({ q: 'vue', page: '3' });

      expect(component.params.isValid()).toBe(true);
      expect(component.params.error()).toBeNull();
      expect(component.params.value()).toEqual({ q: 'vue', page: 3 });
    });
  });
});

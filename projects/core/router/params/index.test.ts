import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Params } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { params } from './index';

describe(params.name, () => {
  let paramsState: BehaviorSubject<Params>;

  beforeEach(() => {
    paramsState = new BehaviorSubject<Params>({});

    TestBed.configureTestingModule({
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: paramsState.asObservable(),
            snapshot: { params: paramsState.getValue() },
          },
        },
      ],
    });
  });

  @Component({ template: '{{ routeParams().id }} {{ routeParams().slug }}' })
  class TestComponent {
    readonly routeParams = params<{ id: string; slug: string }>();
  }

  it('should update when route params change', () => {
    paramsState.next({ id: '123', slug: 'test-post' });
    const fixture = TestBed.createComponent(TestComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.routeParams()).toEqual({ id: '123', slug: 'test-post' });

    paramsState.next({ id: '456', slug: 'another-post' });
    expect(component.routeParams()).toEqual({ id: '456', slug: 'another-post' });

    paramsState.next({ id: '789', slug: 'third-post' });
    expect(component.routeParams()).toEqual({ id: '789', slug: 'third-post' });

    paramsState.next({});
    expect(component.routeParams()).toEqual({});
  });
});

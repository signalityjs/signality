import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Data } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { routeData } from './index';

describe(routeData.name, () => {
  let dataState: BehaviorSubject<Data>;

  beforeEach(() => {
    dataState = new BehaviorSubject<Data>({});

    TestBed.configureTestingModule({
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            data: dataState.asObservable(),
            snapshot: { data: dataState.getValue() },
          },
        },
      ],
    });
  });

  @Component({ template: '{{ data().title }}' })
  class TestComponent {
    readonly data = routeData<{ title: string; showBreadcrumbs: boolean }>();
  }

  it('should update when route data changes', () => {
    dataState.next({ title: 'Home', showBreadcrumbs: true });
    const fixture = TestBed.createComponent(TestComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.data()).toEqual({ title: 'Home', showBreadcrumbs: true });

    dataState.next({ title: 'About', showBreadcrumbs: false });
    expect(component.data()).toEqual({ title: 'About', showBreadcrumbs: false });

    dataState.next({ title: 'Contact', showBreadcrumbs: true });
    expect(component.data()).toEqual({ title: 'Contact', showBreadcrumbs: true });

    dataState.next({});
    expect(component.data()).toEqual({});
  });
});

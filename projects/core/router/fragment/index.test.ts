import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { fragment } from './index';

describe(fragment.name, () => {
  let fragmentState: BehaviorSubject<string | null>;

  beforeEach(() => {
    fragmentState = new BehaviorSubject<string | null>(null);

    TestBed.configureTestingModule({
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            fragment: fragmentState.asObservable(),
            snapshot: { fragment: fragmentState.getValue() },
          },
        },
      ],
    });
  });

  @Component({ template: '#{{ currentFragment() }}' })
  class TestComponent {
    readonly currentFragment = fragment();
  }

  it('should update when fragment changes', () => {
    fragmentState.next('section1');
    const fixture = TestBed.createComponent(TestComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.currentFragment()).toBe('section1');

    fragmentState.next('section2');
    expect(component.currentFragment()).toBe('section2');

    fragmentState.next('section3');
    expect(component.currentFragment()).toBe('section3');

    fragmentState.next(null);
    expect(component.currentFragment()).toBe(null);
  });
});

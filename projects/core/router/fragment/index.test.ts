import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { fragment } from './index';

describe(fragment.name, () => {
  @Component({ template: '#{{ currentFragment() }}' })
  class TestComponent {
    readonly currentFragment = fragment();
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: '**', component: TestComponent }])],
    });
  });

  it('should update when fragment changes', async () => {
    const router = TestBed.inject(Router);
    const fixture = TestBed.createComponent(TestComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    await router.navigate([], { fragment: 'section1' });
    expect(component.currentFragment()).toBe('section1');

    await router.navigate([], { fragment: 'section2' });
    expect(component.currentFragment()).toBe('section2');

    await router.navigate([], { fragment: undefined });
    expect(component.currentFragment()).toBe(null);
  });

  it('should write a new fragment', async () => {
    const router = TestBed.inject(Router);
    const fixture = TestBed.createComponent(TestComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.currentFragment.set('section-1');
    await fixture.whenStable();
    expect(router.url).toContain('#section-1');

    component.currentFragment.update(curr => curr?.slice(0, -1) + '2');
    await fixture.whenStable();
    expect(router.url).toContain('#section-2');
  });
});

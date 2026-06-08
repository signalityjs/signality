import { vi, type Mock } from 'vitest';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';
import { title } from './index';

describe(title.name, () => {
  let titleState: BehaviorSubject<string | undefined>;
  let mockTitle: { getTitle: Mock; setTitle: Mock };

  beforeEach(() => {
    titleState = new BehaviorSubject<string | undefined>(undefined);

    mockTitle = {
      getTitle: vi.fn().mockReturnValue('Browser Title'),
      setTitle: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            title: titleState.asObservable(),
            snapshot: { title: titleState.getValue() },
          },
        },
        { provide: Title, useValue: mockTitle },
      ],
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  @Component({ template: '{{ pageTitle() }}' })
  class TestComponent {
    readonly pageTitle = title();
  }

  const createComponent = () => {
    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    return fixture.componentInstance;
  };

  it('should update when route title changes', () => {
    titleState.next('Initial Title');
    const component = createComponent();

    expect(component.pageTitle()).toBe('Initial Title');

    titleState.next('About Page');
    expect(component.pageTitle()).toBe('About Page');

    titleState.next('Contact Page');
    expect(component.pageTitle()).toBe('Contact Page');
  });

  it('should use browser title when route title is not set', () => {
    titleState.next(undefined);
    const component = createComponent();

    expect(component.pageTitle()).toBe('Browser Title');
  });

  it('should set browser title when signal is updated', () => {
    const component = createComponent();

    component.pageTitle.set('New Title');

    expect(mockTitle.setTitle).toHaveBeenCalledWith('New Title');
    expect(component.pageTitle()).toBe('New Title');
  });

  it('should handle multiple title updates', () => {
    const component = createComponent();

    component.pageTitle.set('First Update');
    expect(mockTitle.setTitle).toHaveBeenCalledWith('First Update');
    expect(component.pageTitle()).toBe('First Update');

    component.pageTitle.set('Second Update');
    expect(mockTitle.setTitle).toHaveBeenCalledWith('Second Update');
    expect(component.pageTitle()).toBe('Second Update');
  });
});

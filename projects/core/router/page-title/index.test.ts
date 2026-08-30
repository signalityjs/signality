import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';
import { pageTitle } from './index';

describe(pageTitle.name, () => {
  let titleState: BehaviorSubject<string | undefined>;
  let mockTitle: { getTitle: jest.Mock; setTitle: jest.Mock };

  beforeEach(() => {
    titleState = new BehaviorSubject<string | undefined>(undefined);

    mockTitle = {
      getTitle: jest.fn().mockReturnValue('Browser Title'),
      setTitle: jest.fn(),
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
    jest.restoreAllMocks();
  });

  @Component({ template: '{{ title() }}' })
  class TestComponent {
    readonly title = pageTitle();
  }

  const createComponent = () => {
    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    return fixture.componentInstance;
  };

  it('should update when route title changes', () => {
    titleState.next('Initial Title');
    const component = createComponent();

    expect(component.title()).toBe('Initial Title');

    titleState.next('About Page');
    expect(component.title()).toBe('About Page');

    titleState.next('Contact Page');
    expect(component.title()).toBe('Contact Page');
  });

  it('should use browser title when route title is not set', () => {
    titleState.next(undefined);
    const component = createComponent();

    expect(component.title()).toBe('Browser Title');
  });

  it('should set browser title when signal is updated', () => {
    const component = createComponent();

    component.title.set('New Title');

    expect(mockTitle.setTitle).toHaveBeenCalledWith('New Title');
    expect(component.title()).toBe('New Title');
  });

  it('should handle multiple title updates', () => {
    const component = createComponent();

    component.title.set('First Update');
    expect(mockTitle.setTitle).toHaveBeenCalledWith('First Update');
    expect(component.title()).toBe('First Update');

    component.title.set('Second Update');
    expect(mockTitle.setTitle).toHaveBeenCalledWith('Second Update');
    expect(component.title()).toBe('Second Update');
  });
});

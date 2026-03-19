import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { browserLanguage } from './index';

describe(browserLanguage.name, () => {
  let languageSpy: jest.SpyInstance;

  beforeEach(() => {
    languageSpy = jest.spyOn(navigator, 'language', 'get');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  @Component({ template: '{{ language() }}' })
  class TestComponent {
    readonly language = browserLanguage();
  }

  const createComponent = () => {
    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    return fixture.componentInstance;
  };

  const setLanguage = (lang: string) => {
    languageSpy.mockReturnValue(lang);
    window.dispatchEvent(new Event('languagechange'));
  };

  it('should return current navigator language', () => {
    const component = createComponent();

    expect(component.language()).toBe(navigator.language);
  });

  it('should update when languagechange event fires', () => {
    const component = createComponent();

    setLanguage('fr-FR');
    expect(component.language()).toBe('fr-FR');

    setLanguage('sk-SK');
    expect(component.language()).toBe('sk-SK');
  });
});

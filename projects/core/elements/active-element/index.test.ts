import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { activeElement } from './index';

// @TODO: add tests with shadow dom
describe(activeElement.name, () => {
  @Component({
    template: `
      <input id="input1" />
      <input id="input2" />
      <div id="notFocusable">I can’t receive focus because I don’t have a tabindex</div>
    `,
  })
  class TestComponent {
    readonly activeEl = activeElement();
  }

  const createComponent = () => {
    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    return fixture;
  };

  it('should return current active element', () => {
    const { componentInstance } = createComponent();

    expect(componentInstance.activeEl()).toBe(document.activeElement);
  });

  it('should update when focus changes', () => {
    const { componentInstance, nativeElement } = createComponent();
    const input1 = nativeElement.querySelector('#input1') as HTMLInputElement;
    const input2 = nativeElement.querySelector('#input2') as HTMLInputElement;
    const notFocusable = nativeElement.querySelector('#notFocusable') as HTMLDivElement;

    input1.focus();
    expect(componentInstance.activeEl()).toBe(input1);

    input2.focus();
    expect(componentInstance.activeEl()).toBe(input2);

    input2.blur();
    expect(componentInstance.activeEl()).not.toBe(input2);

    notFocusable.focus();
    expect(componentInstance.activeEl()).not.toBe(notFocusable);
  });
});

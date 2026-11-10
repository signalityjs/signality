import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { eyeDropper } from './index';

describe(eyeDropper.name, () => {
  let mockEyeDropper: {
    open: jest.Mock;
  };

  beforeEach(() => {
    mockEyeDropper = { open: jest.fn() };
    (window as any).EyeDropper = jest.fn(() => mockEyeDropper);
  });

  @Component({ template: '{{ picker.value() }}' })
  class TestComponent {
    readonly picker = eyeDropper();
  }

  const createComponent = () => {
    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    return fixture.componentInstance;
  };

  it('should return initial value', () => {
    const component = createComponent();

    expect(component.picker.value()).toBe('');
  });

  it('should update value when open is called', async () => {
    const component = createComponent();
    mockEyeDropper.open.mockResolvedValue({ sRGBHex: '#ff0000' });

    await component.picker.open();

    expect(component.picker.value()).toBe('#ff0000');
  });

  it('should handle multiple color selections', async () => {
    const component = createComponent();

    mockEyeDropper.open.mockResolvedValue({ sRGBHex: '#ff0000' });
    await component.picker.open();
    expect(component.picker.value()).toBe('#ff0000');

    mockEyeDropper.open.mockResolvedValue({ sRGBHex: '#00ff00' });
    await component.picker.open();
    expect(component.picker.value()).toBe('#00ff00');

    mockEyeDropper.open.mockResolvedValue({ sRGBHex: '#0000ff' });
    await component.picker.open();
    expect(component.picker.value()).toBe('#0000ff');
  });

  it('should keep the deprecated sRGBHex as an alias of value', async () => {
    const component = createComponent();
    mockEyeDropper.open.mockResolvedValue({ sRGBHex: '#ff0000' });

    await component.picker.open();

    expect(component.picker.sRGBHex).toBe(component.picker.value);
    expect(component.picker.sRGBHex()).toBe('#ff0000');
  });

  it('should keep the deprecated sRGBHex as an alias of value when unsupported', () => {
    delete (window as any).EyeDropper;

    const component = createComponent();

    expect(component.picker.isSupported()).toBe(false);
    expect(component.picker.value()).toBe('');
    expect(component.picker.sRGBHex).toBe(component.picker.value);
  });
});

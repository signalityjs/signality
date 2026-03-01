import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { clipboard } from './index';

describe(clipboard.name, () => {
  // we need mock because: https://github.com/jsdom/jsdom/issues/1568
  let mockClipboard: {
    writeText: jest.Mock;
    readText: jest.Mock;
  };

  beforeEach(() => {
    mockClipboard = {
      writeText: jest.fn(),
      readText: jest.fn(),
    };

    (navigator as any).clipboard = mockClipboard;
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  @Component({ template: '' })
  class TestComponent {
    readonly cb = clipboard();
  }

  const createComponent = () => {
    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    return fixture.componentInstance;
  };

  it('should copy text to clipboard', async () => {
    const component = createComponent();
    mockClipboard.writeText.mockResolvedValue(undefined);

    await component.cb.copy('Hello World');

    expect(mockClipboard.writeText).toHaveBeenCalledWith('Hello World');
    expect(component.cb.text()).toBe('Hello World');
    expect(component.cb.copied()).toBe(true);
  });

  it('should reset copied state after copiedDuration', async () => {
    const component = createComponent();
    mockClipboard.writeText.mockResolvedValue(undefined);

    await component.cb.copy('Test');
    expect(component.cb.copied()).toBe(true);

    jest.advanceTimersByTime(1500);
    expect(component.cb.copied()).toBe(false);
  });

  it('should handle multiple copy operations', async () => {
    const component = createComponent();
    mockClipboard.writeText.mockResolvedValue(undefined);

    await component.cb.copy('First');
    expect(component.cb.text()).toBe('First');
    expect(component.cb.copied()).toBe(true);

    await component.cb.copy('Second');
    expect(component.cb.text()).toBe('Second');
    expect(component.cb.copied()).toBe(true);

    jest.advanceTimersByTime(1500);
    expect(component.cb.copied()).toBe(false);
  });

  it('should paste text from clipboard', async () => {
    const component = createComponent();
    mockClipboard.readText.mockResolvedValue('Pasted Text');

    const result = await component.cb.paste();

    expect(mockClipboard.readText).toHaveBeenCalled();
    expect(result).toBe('Pasted Text');
    expect(component.cb.text()).toBe('Pasted Text');
  });

  it('should handle copy errors', async () => {
    const component = createComponent();
    mockClipboard.writeText.mockRejectedValue(new Error('Permission denied'));

    await component.cb.copy('Test');

    expect(component.cb.copied()).toBe(false);
  });

  it('should handle paste errors', async () => {
    const component = createComponent();
    mockClipboard.readText.mockRejectedValue(new Error('Permission denied'));

    const result = await component.cb.paste();

    expect(result).toBe('');
  });
});

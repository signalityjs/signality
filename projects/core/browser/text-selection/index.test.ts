import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { textSelection } from './index';

describe(textSelection.name, () => {
  let getSelectionSpy: jest.SpyInstance;
  let mockSelection: Selection;

  beforeEach(() => {
    mockSelection = {
      toString: jest.fn(() => ''),
      rangeCount: 0,
      getRangeAt: jest.fn(),
      removeAllRanges: jest.fn(),
    } as unknown as Selection;

    getSelectionSpy = jest.spyOn(window, 'getSelection').mockReturnValue(mockSelection);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  @Component({ template: '{{ selection.text() }}' })
  class TestComponent {
    readonly selection = textSelection();
  }

  const createComponent = () => {
    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    return fixture.componentInstance;
  };

  const selectText = (text: string, ranges: Range[] = []) => {
    (mockSelection.toString as jest.Mock).mockReturnValue(text);
    (mockSelection as { rangeCount: number }).rangeCount = ranges.length;
    (mockSelection.getRangeAt as jest.Mock).mockImplementation((i: number) => ranges[i]);

    document.dispatchEvent(new Event('selectionchange'));
  };

  const createMockRange = (text: string): Range => {
    return {
      toString: () => text,
      getBoundingClientRect: () => new DOMRect(0, 0, 100, 20),
    } as Range;
  };

  it('should have empty text initially', () => {
    const component = createComponent();

    expect(component.selection.text()).toBe('');
  });

  it('should have empty ranges initially', () => {
    const component = createComponent();

    expect(component.selection.ranges()).toEqual([]);
  });

  it('should have empty rects initially', () => {
    const component = createComponent();

    expect(component.selection.rects()).toEqual([]);
  });

  it('should update text when selection changes', () => {
    const component = createComponent();

    selectText('Hello World');

    expect(component.selection.text()).toBe('Hello World');
  });

  it('should update ranges when selection changes', () => {
    const component = createComponent();

    const range = createMockRange('Selected text');
    selectText('Selected text', [range]);

    const ranges = component.selection.ranges();
    expect(ranges.length).toBe(1);
    expect(ranges[0].toString()).toBe('Selected text');
  });

  it('should update rects when selection changes', () => {
    const component = createComponent();

    const range = createMockRange('Text');
    selectText('Text', [range]);

    const rects = component.selection.rects();
    expect(rects.length).toBe(1);
    expect(rects[0]).toBeInstanceOf(DOMRect);
  });

  it('should handle multiple ranges', () => {
    const component = createComponent();

    const range1 = createMockRange('First');
    const range2 = createMockRange('Second');
    selectText('FirstSecond', [range1, range2]);

    expect(component.selection.ranges().length).toBe(2);
    expect(component.selection.rects().length).toBe(2);
  });

  it('should clear selection when clear is called', () => {
    const component = createComponent();

    selectText('Selected');
    expect(component.selection.text()).toBe('Selected');

    component.selection.clear();

    expect(mockSelection.removeAllRanges).toHaveBeenCalled();
  });

  it('should have selection object', () => {
    const component = createComponent();

    expect(component.selection.selection()).toBe(mockSelection);
  });
});

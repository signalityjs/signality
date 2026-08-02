import { Component, ElementRef, Injector, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { KeyFilter, OnKeyOptions } from './index';
import { onKey } from './index';

describe(onKey.name, () => {
  function dispatchKey(
    init: KeyboardEventInit,
    target: EventTarget = window,
    type = 'keydown'
  ): void {
    target.dispatchEvent(new KeyboardEvent(type, { bubbles: true, cancelable: true, ...init }));
  }

  function setup(key: KeyFilter, options?: OnKeyOptions) {
    const handler = jest.fn();

    @Component({ template: '' })
    class TestComponent {
      readonly ref = onKey(key, handler, options);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    return { handler, fixture, ref: fixture.componentInstance.ref };
  }

  describe('string filter', () => {
    it('should call handler when event.key matches', () => {
      const { handler } = setup('a');

      dispatchKey({ key: 'a' });

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should not call handler for a non-matching key', () => {
      const { handler } = setup('a');

      dispatchKey({ key: 'b' });

      expect(handler).not.toHaveBeenCalled();
    });

    it('should match single characters case-insensitively', () => {
      const { handler } = setup('a');

      dispatchKey({ key: 'A' });

      expect(handler).toHaveBeenCalledTimes(1);

      dispatchKey({ key: 'a' });

      expect(handler).toHaveBeenCalledTimes(2);
    });

    it('should ignore modifier flags for string filters', () => {
      const { handler } = setup('s');

      dispatchKey({ key: 's', ctrlKey: true });

      expect(handler).toHaveBeenCalledTimes(1);

      // Shift produces the shifted character, but case does not affect the match
      dispatchKey({ key: 'S', shiftKey: true });

      expect(handler).toHaveBeenCalledTimes(2);
    });

    it('should keep multi-character keys exact', () => {
      const { handler } = setup('enter');

      dispatchKey({ key: 'Enter' });

      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('array combination filter', () => {
    it('should fire when the exact combination is pressed', () => {
      const { handler } = setup(['Control', 'k']);

      dispatchKey({ key: 'k', ctrlKey: true });

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should not fire without the declared modifier', () => {
      const { handler } = setup(['Control', 'k']);

      dispatchKey({ key: 'k' });

      expect(handler).not.toHaveBeenCalled();
    });

    it('should not fire when an extra modifier is pressed', () => {
      const { handler } = setup(['Control', 'k']);

      dispatchKey({ key: 'k', ctrlKey: true, shiftKey: true });

      expect(handler).not.toHaveBeenCalled();
    });

    it('should not fire on the modifier keydown itself', () => {
      const { handler } = setup(['Control', 'k']);

      dispatchKey({ key: 'Control', ctrlKey: true });

      expect(handler).not.toHaveBeenCalled();
    });

    it('should ignore the order of keys in the array', () => {
      const { handler } = setup(['k', 'Control']);

      dispatchKey({ key: 'k', ctrlKey: true });

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should require exact modifiers for a single-key array', () => {
      const { handler } = setup(['s']);

      dispatchKey({ key: 's', ctrlKey: true });

      expect(handler).not.toHaveBeenCalled();

      dispatchKey({ key: 's' });

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should match a letter combination regardless of CapsLock', () => {
      const { handler } = setup(['Meta', 'k']);

      // CapsLock produces the uppercase character without shiftKey
      dispatchKey({ key: 'K', metaKey: true });

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should treat the filter letter case as equivalent', () => {
      const { handler } = setup(['Meta', 'K']);

      dispatchKey({ key: 'k', metaKey: true });

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should match a Shift combination with CapsLock-inverted case', () => {
      const { handler } = setup(['Meta', 'Shift', 'K']);

      // CapsLock + Shift inverts the character back to lowercase
      dispatchKey({ key: 'k', metaKey: true, shiftKey: true });

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should keep multi-character keys exact', () => {
      const { handler } = setup(['Control', 'enter']);

      dispatchKey({ key: 'Enter', ctrlKey: true });

      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('modifier-only combination', () => {
    it('should fire when the last declared modifier completes the combination', () => {
      const { handler } = setup(['Control', 'Shift']);

      dispatchKey({ key: 'Shift', ctrlKey: true, shiftKey: true });

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should not fire while the combination is incomplete', () => {
      const { handler } = setup(['Control', 'Shift']);

      dispatchKey({ key: 'Control', ctrlKey: true });

      expect(handler).not.toHaveBeenCalled();
    });

    it('should not fire with an extra modifier', () => {
      const { handler } = setup(['Meta']);

      dispatchKey({ key: 'Meta', metaKey: true, shiftKey: true });

      expect(handler).not.toHaveBeenCalled();
    });

    it('should not fire for a regular key with matching flags', () => {
      const { handler } = setup(['Meta']);

      dispatchKey({ key: 'a', metaKey: true });

      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('invalid filter', () => {
    it('should throw in dev mode for two non-modifier keys', () => {
      expect(() => setup(['a', 'b'])).toThrow(/at most one non-modifier key/);
    });

    it('should never match for an empty array', () => {
      const { handler } = setup([]);

      dispatchKey({ key: 'a' });
      dispatchKey({ key: 'k', metaKey: true });
      dispatchKey({ key: 'Shift', shiftKey: true });

      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('predicate filter', () => {
    it('should use the custom predicate', () => {
      const { handler } = setup(event => event.key === 'x');

      dispatchKey({ key: 'x' });
      dispatchKey({ key: 'y' });

      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe('handler-only overload', () => {
    it('should fire on every key without a filter', () => {
      const handler = jest.fn();

      @Component({ template: '' })
      class TestComponent {
        readonly ref = onKey(handler);
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      dispatchKey({ key: 'a' });
      dispatchKey({ key: 'Escape' });
      dispatchKey({ key: 'F5' });

      expect(handler).toHaveBeenCalledTimes(3);
    });

    it('should accept options as the second argument', () => {
      const handler = jest.fn();

      @Component({ template: '' })
      class TestComponent {
        readonly ref = onKey(handler, { eventName: 'keyup' });
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      dispatchKey({ key: 'a' });

      expect(handler).not.toHaveBeenCalled();

      dispatchKey({ key: 'a' }, window, 'keyup');

      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe('reactive filter', () => {
    it('should follow the filter signal', () => {
      const key = signal<string | string[]>('a');
      const { handler } = setup(key);

      dispatchKey({ key: 'a' });

      expect(handler).toHaveBeenCalledTimes(1);

      key.set('b');
      TestBed.tick();
      dispatchKey({ key: 'a' });

      expect(handler).toHaveBeenCalledTimes(1);

      dispatchKey({ key: 'b' });

      expect(handler).toHaveBeenCalledTimes(2);
    });

    it('should support switching between string and combination', () => {
      const key = signal<string | string[]>('a');
      const { handler } = setup(key);

      key.set(['Meta', 'k']);
      TestBed.tick();
      dispatchKey({ key: 'k', metaKey: true });

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should act as a disabled hotkey while the filter signal is an empty array', () => {
      const key = signal<string | string[]>([]);
      const { handler } = setup(key);

      dispatchKey({ key: 'k', metaKey: true });

      expect(handler).not.toHaveBeenCalled();

      key.set(['Meta', 'k']);
      TestBed.tick();
      dispatchKey({ key: 'k', metaKey: true });

      expect(handler).toHaveBeenCalledTimes(1);

      key.set([]);
      TestBed.tick();
      dispatchKey({ key: 'k', metaKey: true });

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should re-bind the listener when the filter changes', () => {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
      const key = signal('a');
      setup(key);

      const keydownCalls = (spy: jest.SpyInstance) =>
        spy.mock.calls.filter(([type]) => type === 'keydown').length;
      const initialAdded = keydownCalls(addEventListenerSpy);
      const initialRemoved = keydownCalls(removeEventListenerSpy);

      key.set('b');
      TestBed.tick();

      expect(keydownCalls(addEventListenerSpy)).toBe(initialAdded + 1);
      expect(keydownCalls(removeEventListenerSpy)).toBe(initialRemoved + 1);

      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
    });

    it('should not re-bind while the filter value is unchanged', () => {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
      const key = signal('a');
      const { handler } = setup(key);

      const keydownRegistrations = () =>
        addEventListenerSpy.mock.calls.filter(([type]) => type === 'keydown').length;
      const initialCount = keydownRegistrations();

      dispatchKey({ key: 'a' });
      TestBed.tick();
      dispatchKey({ key: 'a' });

      expect(handler).toHaveBeenCalledTimes(2);
      expect(keydownRegistrations()).toBe(initialCount);

      addEventListenerSpy.mockRestore();
    });

    it('should stop re-binding after destroy', () => {
      const key = signal('a');
      const { handler, ref } = setup(key);

      ref.destroy();
      key.set('b');
      TestBed.tick();
      dispatchKey({ key: 'b' });

      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('dedupe option', () => {
    it('should fire on repeat events by default', () => {
      const { handler } = setup('a');

      dispatchKey({ key: 'a', repeat: true });

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should skip repeat events when dedupe is true', () => {
      const { handler } = setup('a', { dedupe: true });

      dispatchKey({ key: 'a', repeat: true });

      expect(handler).not.toHaveBeenCalled();

      dispatchKey({ key: 'a', repeat: false });

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should react to a dedupe signal', () => {
      const dedupe = signal(false);
      const { handler } = setup('a', { dedupe });

      dispatchKey({ key: 'a', repeat: true });

      expect(handler).toHaveBeenCalledTimes(1);

      dedupe.set(true);
      dispatchKey({ key: 'a', repeat: true });

      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe('eventName option', () => {
    it('should default to keydown', () => {
      const { handler } = setup('a');

      dispatchKey({ key: 'a' }, window, 'keyup');

      expect(handler).not.toHaveBeenCalled();
    });

    it('should listen to keyup when configured', () => {
      const { handler } = setup('a', { eventName: 'keyup' });

      dispatchKey({ key: 'a' });

      expect(handler).not.toHaveBeenCalled();

      dispatchKey({ key: 'a' }, window, 'keyup');

      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe('target option', () => {
    it('should scope to an element target', () => {
      const handler = jest.fn();

      @Component({ template: '<input #input />' })
      class TestComponent {
        readonly input = viewChild<ElementRef>('input');
        readonly ref = onKey('a', handler, { target: this.input });
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
      dispatchKey({ key: 'a' }, input);

      expect(handler).toHaveBeenCalledTimes(1);

      dispatchKey({ key: 'a' }, document.body);

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should support document as a target', () => {
      const { handler } = setup('a', { target: document });

      dispatchKey({ key: 'a' }, document);

      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe('passive option', () => {
    it('should register a passive listener', () => {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');

      setup('a', { passive: true });

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'keydown',
        expect.any(Function),
        expect.objectContaining({ passive: true })
      );

      addEventListenerSpy.mockRestore();
    });
  });

  describe('destroy', () => {
    it('should stop listening after destroy', () => {
      const { handler, ref } = setup('a');

      dispatchKey({ key: 'a' });

      expect(handler).toHaveBeenCalledTimes(1);

      ref.destroy();
      dispatchKey({ key: 'a' });

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should tolerate multiple destroy calls', () => {
      const { ref } = setup('a');

      expect(() => {
        ref.destroy();
        ref.destroy();
        ref.destroy();
      }).not.toThrow();
    });
  });

  describe('injector option', () => {
    it('should work outside an injection context', () => {
      const handler = jest.fn();
      const injector = TestBed.inject(Injector);

      const ref = onKey('a', handler, { injector });

      dispatchKey({ key: 'a' });

      expect(handler).toHaveBeenCalledTimes(1);

      ref.destroy();
    });
  });
});

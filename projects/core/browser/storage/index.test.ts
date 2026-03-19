import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { storage } from './index';

describe(storage.name, () => {
  let mockLocalStorage: Record<string, string>;
  let mockSessionStorage: Record<string, string>;

  beforeEach(() => {
    mockLocalStorage = {};
    mockSessionStorage = {};

    const createStorageMock = (store: Record<string, string>) => ({
      getItem: jest.fn((key: string) => store[key] ?? null),
      setItem: jest.fn((key: string, value: string) => (store[key] = value)),
      removeItem: jest.fn((key: string) => delete store[key]),
      clear: jest.fn(() => Object.keys(store).forEach(key => delete store[key])),
      key: jest.fn((index: number) => Object.keys(store)[index] ?? null),
      get length() {
        return Object.keys(store).length;
      },
    });

    Object.defineProperty(window, 'localStorage', {
      writable: true,
      value: createStorageMock(mockLocalStorage),
    });

    Object.defineProperty(window, 'sessionStorage', {
      writable: true,
      value: createStorageMock(mockSessionStorage),
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('string values', () => {
    @Component({ template: '{{ username() }}' })
    class TestComponent {
      readonly username = storage('username', 'guest');
    }

    const createComponent = () => {
      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      return fixture.componentInstance;
    };

    it('should return initial value when storage is empty', () => {
      const component = createComponent();

      expect(component.username()).toBe('guest');
    });

    it('should read value from storage', () => {
      mockLocalStorage['username'] = 'john';
      const component = createComponent();

      expect(component.username()).toBe('john');
    });

    it('should write value to storage on set', () => {
      const component = createComponent();

      component.username.set('alice');

      expect(component.username()).toBe('alice');
      expect(mockLocalStorage['username']).toBe('alice');
    });

    it('should remove value from storage when set to null', () => {
      mockLocalStorage['username'] = 'john';
      const component = createComponent();

      component.username.set(null as any);

      expect(mockLocalStorage['username']).toBeUndefined();
    });
  });

  describe('number values', () => {
    @Component({ template: '{{ count() }}' })
    class TestComponent {
      readonly count = storage('count', 0);
    }

    const createComponent = () => {
      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      return fixture.componentInstance;
    };

    it('should handle number serialization', () => {
      const component = createComponent();

      component.count.set(42);

      expect(component.count()).toBe(42);
      expect(mockLocalStorage['count']).toBe('42');
    });

    it('should handle Infinity', () => {
      const component = createComponent();

      component.count.set(Infinity);

      expect(component.count()).toBe(Infinity);
      expect(mockLocalStorage['count']).toBe('Infinity');
    });

    it('should handle NaN', () => {
      const component = createComponent();

      component.count.set(NaN);

      expect(component.count()).toBeNaN();
      expect(mockLocalStorage['count']).toBe('NaN');
    });
  });

  describe('boolean values', () => {
    @Component({ template: '{{ isActive() }}' })
    class TestComponent {
      readonly isActive = storage('isActive', false);
    }

    const createComponent = () => {
      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      return fixture.componentInstance;
    };

    it('should handle boolean serialization', () => {
      const component = createComponent();

      component.isActive.set(true);

      expect(component.isActive()).toBe(true);
      expect(mockLocalStorage['isActive']).toBe('true');

      component.isActive.set(false);

      expect(component.isActive()).toBe(false);
      expect(mockLocalStorage['isActive']).toBe('false');
    });
  });

  describe('object values', () => {
    @Component({ template: '' })
    class TestComponent {
      readonly settings = storage('settings', { theme: 'dark', fontSize: 14 });
    }

    const createComponent = () => {
      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      return fixture.componentInstance;
    };

    it('should handle object serialization', () => {
      const component = createComponent();

      component.settings.set({ theme: 'light', fontSize: 16 });

      expect(component.settings()).toEqual({ theme: 'light', fontSize: 16 });
      expect(mockLocalStorage['settings']).toBe('{"theme":"light","fontSize":16}');
    });

    it('should read object from storage', () => {
      mockLocalStorage['settings'] = '{"theme":"light","fontSize":18}';
      const component = createComponent();

      expect(component.settings()).toEqual({ theme: 'light', fontSize: 18 });
    });
  });

  describe('Date values', () => {
    @Component({ template: '' })
    class TestComponent {
      readonly lastVisit = storage('lastVisit', new Date('2024-01-01'));
    }

    const createComponent = () => {
      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      return fixture.componentInstance;
    };

    it('should handle Date serialization', () => {
      const component = createComponent();
      const date = new Date('2024-12-25');

      component.lastVisit.set(date);

      expect(component.lastVisit()).toEqual(date);
      expect(mockLocalStorage['lastVisit']).toBe(date.toISOString());
    });
  });

  describe('Map values', () => {
    @Component({ template: '' })
    class TestComponent {
      readonly map = storage('map', new Map([['key1', 'value1']]));
    }

    const createComponent = () => {
      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      return fixture.componentInstance;
    };

    it('should handle Map serialization', () => {
      const component = createComponent();
      const newMap = new Map([
        ['key1', 'value1'],
        ['key2', 'value2'],
      ]);

      component.map.set(newMap);

      expect(component.map()).toEqual(newMap);
      expect(mockLocalStorage['map']).toBe('[["key1","value1"],["key2","value2"]]');
    });
  });

  describe('Set values', () => {
    @Component({ template: '' })
    class TestComponent {
      readonly set = storage('set', new Set([1, 2, 3]));
    }

    const createComponent = () => {
      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      return fixture.componentInstance;
    };

    it('should handle Set serialization', () => {
      const component = createComponent();
      const newSet = new Set([4, 5, 6]);

      component.set.set(newSet);

      expect(component.set()).toEqual(newSet);
      expect(mockLocalStorage['set']).toBe('[4,5,6]');
    });
  });

  describe('sessionStorage', () => {
    @Component({ template: '{{ token() }}' })
    class TestComponent {
      readonly token = storage('token', '', { type: 'session' });
    }

    const createComponent = () => {
      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      return fixture.componentInstance;
    };

    it('should use sessionStorage instead of localStorage', () => {
      const component = createComponent();

      component.token.set('abc123');

      expect(component.token()).toBe('abc123');
      expect(mockSessionStorage['token']).toBe('abc123');
      expect(mockLocalStorage['token']).toBeUndefined();
    });
  });

  describe('mergeResolver option', () => {
    @Component({ template: '' })
    class TestComponent {
      readonly settings = storage(
        'settings',
        { theme: 'dark', fontSize: 14, newProp: true },
        {
          mergeResolver: (stored, initial) => ({ ...initial, ...stored }),
        }
      );
    }

    const createComponent = () => {
      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      return fixture.componentInstance;
    };

    it('should merge stored value with initial value', () => {
      mockLocalStorage['settings'] = '{"theme":"light"}';
      const component = createComponent();

      expect(component.settings()).toEqual({ theme: 'light', fontSize: 14, newProp: true });
    });
  });

  describe('reactive key', () => {
    @Component({ template: '' })
    class TestComponent {
      readonly keySignal = signal('key1');
      readonly value = storage(this.keySignal, 'default');
    }

    it('should react to key changes', () => {
      mockLocalStorage['key1'] = 'value1';
      mockLocalStorage['key2'] = 'value2';
      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      expect(fixture.componentInstance.value()).toBe('value1');

      fixture.componentInstance.keySignal.set('key2');
      fixture.detectChanges();

      expect(fixture.componentInstance.value()).toBe('value2');
    });
  });

  describe('tab sync', () => {
    @Component({ template: '' })
    class TestComponent {
      readonly shared = storage('shared', 'initial');
    }

    const createComponent = () => {
      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      return fixture.componentInstance;
    };

    it('should sync changes from other tabs', () => {
      const component = createComponent();

      expect(component.shared()).toBe('initial');

      // Simulate storage event from another tab
      // jsdom rejects mock Storage objects in the StorageEvent constructor,
      // so we create a base event and override readonly properties via defineProperties
      const storageEvent = new StorageEvent('storage');
      Object.defineProperties(storageEvent, {
        key: { value: 'shared' },
        newValue: { value: 'updated' },
        oldValue: { value: 'initial' },
        storageArea: { value: window.localStorage },
      });

      window.dispatchEvent(storageEvent);

      expect(component.shared()).toBe('updated');
    });
  });

  describe('custom serializer', () => {
    @Component({ template: '' })
    class TestComponent {
      readonly custom = storage('custom', 10, {
        serializer: {
          write: (v: number) => `custom-${v}`,
          read: (s: string) => Number(s.replace('custom-', '')),
        },
      });
    }

    const createComponent = () => {
      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      return fixture.componentInstance;
    };

    it('should use custom serializer', () => {
      const component = createComponent();

      component.custom.set(42);

      expect(component.custom()).toBe(42);
      expect(mockLocalStorage['custom']).toBe('custom-42');
    });
  });
});

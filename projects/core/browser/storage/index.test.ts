import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { getWebStorage, LOCAL_STORAGE, SESSION_STORAGE, storage, type StorageLike } from './index';

const createMemoryStorage = (initial?: Record<string, string>): StorageLike => {
  const store = new Map<string, string>(initial ? Object.entries(initial) : undefined);

  return {
    getItem: key => store.get(key) ?? null,
    setItem: (key, value) => {
      store.set(key, value);
    },
    removeItem: key => {
      store.delete(key);
    },
  };
};

describe(storage.name, () => {
  let mockLocalStorage: Record<string, string>;
  let mockSessionStorage: Record<string, string>;

  beforeEach(() => {
    mockLocalStorage = {};
    mockSessionStorage = {};

    const createStorageMock = (store: Record<string, string>) => {
      const mock = {
        getItem: jest.fn((key: string) => store[key] ?? null),
        setItem: jest.fn((key: string, value: string) => (store[key] = value)),
        removeItem: jest.fn((key: string) => delete store[key]),
        clear: jest.fn(() => Object.keys(store).forEach(key => delete store[key])),
        key: jest.fn((index: number) => Object.keys(store)[index] ?? null),
        get length() {
          return Object.keys(store).length;
        },
      };

      // Make the mock a genuine `Storage` so `storage()` uses the native
      // StorageEvent sync path (matches production localStorage/sessionStorage).
      Object.setPrototypeOf(mock, Storage.prototype);
      return mock;
    };

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
      readonly token = storage('token', '', { storage: 'session' });
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

  describe('deprecated type option', () => {
    it('should still select sessionStorage', () => {
      @Component({ template: '' })
      class TestComponent {
        readonly token = storage('token', '', { type: 'session' });
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      fixture.componentInstance.token.set('abc123');

      expect(mockSessionStorage['token']).toBe('abc123');
      expect(mockLocalStorage['token']).toBeUndefined();
    });

    it('should be ignored when the storage option is provided', () => {
      @Component({ template: '' })
      class TestComponent {
        readonly token = storage('token', '', { type: 'session', storage: 'local' });
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      fixture.componentInstance.token.set('abc123');

      expect(mockLocalStorage['token']).toBe('abc123');
      expect(mockSessionStorage['token']).toBeUndefined();
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

  describe('proxied storage (non-built-in)', () => {
    // A plain object is NOT an `instanceof Storage`, mimicking a proxied or
    // custom localStorage where a StorageEvent cannot be constructed. The outer
    // beforeEach installs a genuine-Storage mock, so override it here.
    beforeEach(() => {
      Object.defineProperty(window, 'localStorage', {
        configurable: true,
        writable: true,
        value: {
          getItem: jest.fn((key: string) => mockLocalStorage[key] ?? null),
          setItem: jest.fn((key: string, value: string) => (mockLocalStorage[key] = value)),
          removeItem: jest.fn((key: string) => delete mockLocalStorage[key]),
          clear: jest.fn(() =>
            Object.keys(mockLocalStorage).forEach(key => delete mockLocalStorage[key])
          ),
          key: jest.fn((index: number) => Object.keys(mockLocalStorage)[index] ?? null),
          get length() {
            return Object.keys(mockLocalStorage).length;
          },
        },
      });
    });

    @Component({ template: '' })
    class TestComponent {
      readonly shared = storage('shared', 'initial');
    }

    const createComponent = () => {
      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      return fixture.componentInstance;
    };

    it('should sync via CustomEvent when storage is not built-in', () => {
      const component = createComponent();

      expect(component.shared()).toBe('initial');

      // The refactored code listens for a CustomEvent (not StorageEvent) when
      // the storage is not an `instanceof Storage`.
      // Event name must match STORAGE_EVENT_NAME in index.ts.
      window.dispatchEvent(
        new CustomEvent('signality-storage', {
          detail: {
            key: 'shared',
            oldValue: 'initial',
            newValue: 'updated',
            storageArea: window.localStorage,
          },
        })
      );

      expect(component.shared()).toBe('updated');
    });
  });

  describe('same-document sync (built-in storage)', () => {
    // Two signals bound to the same key in the same document stay in sync via the
    // CustomEvent dispatched on write — the native `'storage'` event never fires
    // in the writing document.
    @Component({ template: '' })
    class TestComponent {
      readonly shared = storage('shared', 'initial');
    }

    const createComponent = () => {
      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      return fixture.componentInstance;
    };

    it('should sync sibling instances bound to the same key', () => {
      const writer = createComponent();
      const reader = createComponent();

      expect(reader.shared()).toBe('initial');

      writer.shared.set('updated');

      expect(writer.shared()).toBe('updated');
      expect(reader.shared()).toBe('updated');
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

  describe('custom storage via options.storage', () => {
    let customStorage: StorageLike;

    beforeEach(() => {
      customStorage = createMemoryStorage();
    });

    @Component({ template: '' })
    class TestComponent {
      readonly value = storage('inline', 'initial', { storage: customStorage });
    }

    const createComponent = () => {
      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      return fixture.componentInstance;
    };

    it('should use the provided storage and not touch Web Storage', () => {
      const component = createComponent();

      component.value.set('custom');

      expect(component.value()).toBe('custom');
      expect(customStorage.getItem('inline')).toBe('custom');
      expect(window.localStorage.setItem).not.toHaveBeenCalled();
      expect(window.localStorage.getItem).not.toHaveBeenCalled();
    });

    it('should take precedence over the DI token', () => {
      const diStorage = createMemoryStorage();
      TestBed.configureTestingModule({
        providers: [{ provide: LOCAL_STORAGE, useValue: diStorage }],
      });
      const component = createComponent();

      component.value.set('custom');

      expect(customStorage.getItem('inline')).toBe('custom');
      expect(diStorage.getItem('inline')).toBeNull();
    });

    it('should behave like a plain signal when storage is null', () => {
      @Component({ template: '' })
      class DisabledComponent {
        readonly value = storage('disabled', 'initial', { storage: null });
      }

      const fixture = TestBed.createComponent(DisabledComponent);
      fixture.detectChanges();
      const component = fixture.componentInstance;

      component.value.set('next');

      expect(component.value()).toBe('next');
      expect(window.localStorage.setItem).not.toHaveBeenCalled();
    });

    it('should sync instances sharing the same storage', () => {
      const writer = createComponent();
      const reader = createComponent();

      writer.value.set('changed');

      expect(reader.value()).toBe('changed');
    });

    it('should isolate instances with distinct storage instances', () => {
      const otherStorage = createMemoryStorage();

      @Component({ template: '' })
      class OtherComponent {
        readonly value = storage('inline', 'initial', { storage: otherStorage });
      }

      const writer = createComponent();
      const fixture = TestBed.createComponent(OtherComponent);
      fixture.detectChanges();
      const reader = fixture.componentInstance;

      writer.value.set('changed');

      expect(reader.value()).toBe('initial');
      expect(otherStorage.getItem('inline')).toBe('initial');
    });
  });

  describe('custom storage via DI tokens', () => {
    @Component({ template: '' })
    class LocalComponent {
      readonly username = storage('username', 'guest');
    }

    @Component({ template: '' })
    class SessionComponent {
      readonly token = storage('token', '', { storage: 'session' });
    }

    const createComponent = <T>(componentType: new () => T) => {
      const fixture = TestBed.createComponent(componentType);
      fixture.detectChanges();
      return fixture.componentInstance;
    };

    it('should resolve the storage from LOCAL_STORAGE', () => {
      const customStorage = createMemoryStorage({ username: 'stored' });
      TestBed.configureTestingModule({
        providers: [{ provide: LOCAL_STORAGE, useValue: customStorage }],
      });
      const component = createComponent(LocalComponent);

      expect(component.username()).toBe('stored');

      component.username.set('alice');

      expect(customStorage.getItem('username')).toBe('alice');
      expect(window.localStorage.setItem).not.toHaveBeenCalled();
      expect(window.localStorage.getItem).not.toHaveBeenCalled();
    });

    it('should resolve the storage from SESSION_STORAGE for storage "session"', () => {
      const customStorage = createMemoryStorage();
      TestBed.configureTestingModule({
        providers: [{ provide: SESSION_STORAGE, useValue: customStorage }],
      });
      const component = createComponent(SessionComponent);

      component.token.set('abc123');

      expect(customStorage.getItem('token')).toBe('abc123');
      expect(window.sessionStorage.setItem).not.toHaveBeenCalled();
      expect(mockLocalStorage['token']).toBeUndefined();
    });

    it('should sync sibling instances through the shared DI storage', () => {
      TestBed.configureTestingModule({
        providers: [{ provide: LOCAL_STORAGE, useValue: createMemoryStorage() }],
      });
      const writer = createComponent(LocalComponent);
      const reader = createComponent(LocalComponent);

      writer.username.set('alice');

      expect(reader.username()).toBe('alice');
    });
  });

  describe(getWebStorage.name, () => {
    it('should return the built-in storage when available', () => {
      expect(getWebStorage('local')).toBe(window.localStorage);
      expect(getWebStorage('session')).toBe(window.sessionStorage);
    });

    it('should return null when the probe throws', () => {
      (window.localStorage.setItem as jest.Mock).mockImplementation(() => {
        throw new Error('denied');
      });

      expect(getWebStorage('local')).toBeNull();
    });

    it('should return the storage when quota is exceeded but storage is non-empty', () => {
      mockLocalStorage['existing'] = 'value';
      (window.localStorage.setItem as jest.Mock).mockImplementation(() => {
        throw new DOMException('quota', 'QuotaExceededError');
      });

      expect(getWebStorage('local')).toBe(window.localStorage);
    });

    it('should return null when quota is exceeded and storage is empty', () => {
      (window.localStorage.setItem as jest.Mock).mockImplementation(() => {
        throw new DOMException('quota', 'QuotaExceededError');
      });

      expect(getWebStorage('local')).toBeNull();
    });
  });
});

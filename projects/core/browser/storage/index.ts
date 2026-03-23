import { type CreateSignalOptions, isSignal, signal, type WritableSignal } from '@angular/core';
import { isPlainObject, proxySignal, setupContext, toValue } from '@signality/core/internal';
import type { MaybeSignal, WithInjector } from '@signality/core/types';
import { listener, setupSync } from '@signality/core/browser/listener';
import { watcher } from '@signality/core/reactivity/watcher';

export interface StorageOptions<T> extends CreateSignalOptions<T>, WithInjector {
  /**
   * Storage type to use.
   * @default 'local'
   */
  readonly type?: 'local' | 'session';

  /**
   * Custom serializer for read/write operations.
   *
   * If not provided, the serializer is automatically inferred from the initial value type:
   * - `string` → pass-through (no transformation)
   * - `number` → handles Infinity, -Infinity, NaN
   * - `boolean` → strict true/false conversion
   * - `bigint` → string representation
   * - `Date` → ISO 8601 format
   * - `Map` → JSON array of entries
   * - `Set` → JSON array
   * - `object/array` → JSON serialization
   *
   * @example
   * ```typescript
   * // Use built-in serializers
   * import { Serializers } from '@signality/core';
   *
   * const counter = storage('count', 0, {
   *   serializer: Serializers.number,
   * });
   *
   * // or create a custom serializer
   * const userSettings = storage('settings', defaultSettings, {
   *   serializer: {
   *     write: (v) => JSON.stringify(v),
   *     read: (s) => ({ ...defaultSettings, ...JSON.parse(s) }),
   *   },
   * });
   * ```
   */
  readonly serializer?: Serializer<T>;

  /**
   * Merge resolver function when reading from storage.
   *
   * Receives stored value and default value, returns the final value.
   * Default: shallow merge for objects ({ ...initialValue, ...stored })
   *
   * Useful for handling schema migrations when default has new properties.
   *
   * @example
   * ```typescript
   * const settings = storage('settings', { theme: 'dark', fontSize: 14 }, {
   *   mergeResolver: (stored, initial) => ({ ...initial, ...stored }),
   * });
   *
   * // Or with custom merge
   * const settings = storage('settings', defaultSettings, {
   *   mergeResolver: (stored, initial) => deepMerge(initial, stored),
   * });
   * ```
   */
  readonly mergeResolver?: (storedValue: T, initialValue: T) => T;
}

/**
 * Serializer interface for converting values to/from strings for storage.
 */
export interface Serializer<T> {
  readonly write: (value: T) => string;
  readonly read: (raw: string) => T;
}

/**
 * Signal-based wrapper around the [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API) (localStorage/sessionStorage).
 *
 * @param key - Storage key (can be a signal for dynamic keys)
 * @param initialValue - Default value if key doesn't exist
 * @param options - Configuration options
 * @returns A WritableSignal that automatically syncs with storage
 *
 * @example
 * Basic usage with automatic serialization:
 * ```typescript
 * @Component({
 *   template: '
 *     <input [(ngModel)]="username" />
 *     <p>Count: {{ count() }}</p>
 *     <button (click)="count.set(count() + 1)">Increment</button>
 *   '
 * })
 * export class UserPreview {
 *   readonly username = storage('username', '');
 *   readonly count = storage('counter', 0); // number serialization inferred
 *   readonly lastVisit = storage('lastVisit', new Date()); // Date serialization inferred
 * }
 * ```
 *
 * @example
 * With options:
 * ```typescript
 * const preferences = storage('prefs', defaultPrefs, {
 *   type: 'session',
 *   mergeWithInitial: true,
 * });
 * ```
 */
export function storage<T>(
  key: MaybeSignal<string>,
  initialValue: T,
  options?: StorageOptions<T>
): WritableSignal<T> {
  const { runInContext } = setupContext(options?.injector, storage);

  return runInContext(({ isServer }) => {
    if (isServer) {
      return signal(initialValue, options);
    }

    const storageType = options?.type ?? 'local';
    const serializer = resolveSerializer(initialValue, options);

    const getStorage = (): Storage | null => {
      const type = storageType === 'local' ? 'localStorage' : 'sessionStorage';

      if (!storageAvailable(type)) {
        if (ngDevMode) {
          console.warn(`[storage] ${type} is not available or accessible`);
        }
        return null;
      }

      return window[type];
    };

    const mergeWithInitial = (storedValue: T) => {
      if (options?.mergeResolver) {
        return options.mergeResolver(storedValue, initialValue);
      }

      if (isPlainObject(initialValue)) {
        return { ...initialValue, ...storedValue };
      }

      return storedValue;
    };

    const readValue = (storageKey: string): T => {
      const storage = getStorage();

      if (storage === null) {
        return initialValue;
      }

      try {
        const raw = storage.getItem(storageKey);

        if (raw === null) {
          if (initialValue != null) {
            writeValue(initialValue);
          }
          return initialValue;
        }

        const parsed = serializer.read(raw);
        return mergeWithInitial(parsed);
      } catch (error) {
        if (ngDevMode) {
          console.warn(`[storage] Failed to deserialize value for key "${key}"`, error);
        }

        return initialValue;
      }
    };

    const writeValue = (value: T): void => {
      const storage = getStorage();
      const storageKey = toValue(key);

      if (storage === null) {
        return;
      }

      try {
        if (value == null) {
          storage.removeItem(storageKey);
        } else {
          const serialized = serializer.write(value);
          storage.setItem(storageKey, serialized);
        }
      } catch (error) {
        if (ngDevMode) {
          console.warn(
            `[storage] Failed to write value for key "${storageKey}". ` +
              `This may be due to storage quota exceeded or serialization error.`,
            error
          );
        }
      }
    };

    const state = signal<T>(readValue(toValue(key)), options);

    if (storageType === 'local') {
      setupSync(() => {
        listener(window, 'storage', event => {
          const currentKey = toValue(key);

          if (event.key === currentKey && event.storageArea === window.localStorage) {
            try {
              const newValue =
                event.newValue === null
                  ? initialValue
                  : mergeWithInitial(serializer.read(event.newValue));

              state.set(newValue);
            } catch (error) {
              if (ngDevMode) {
                console.warn(
                  `[storage] Failed to sync value from other tab for key "${event.key}"`,
                  error
                );
              }
            }
          }
        });
      });
    }

    if (isSignal(key)) {
      watcher(key, newKey => state.set(readValue(newKey)));
    }

    return proxySignal(state, {
      set: (value: T) => {
        state.set(value);
        writeValue(value);
      },
    });
  });
}

export const Serializers = {
  string: {
    read: (v: string): string => v,
    write: (v: string): string => v,
  } satisfies Serializer<string>,

  number: {
    read: (v: string): number => {
      if (v === 'Infinity') return Infinity;
      if (v === '-Infinity') return -Infinity;
      if (v === 'NaN') return NaN;
      return Number.parseFloat(v);
    },
    write: (v: number): string => {
      if (Number.isNaN(v)) return 'NaN';
      if (v === Infinity) return 'Infinity';
      if (v === -Infinity) return '-Infinity';
      return String(v);
    },
  } satisfies Serializer<number>,

  boolean: {
    read: (v: string): boolean => v === 'true',
    write: (v: boolean): string => (v ? 'true' : 'false'),
  } satisfies Serializer<boolean>,

  bigint: {
    read: (v: string): bigint => BigInt(v),
    write: (v: bigint): string => v.toString(),
  } satisfies Serializer<bigint>,

  /*
   * Date serializer - uses ISO 8601 format for maximum compatibility.
   */
  date: {
    read: (v: string): Date => new Date(v),
    write: (v: Date): string => v.toISOString(),
  } satisfies Serializer<Date>,

  object: {
    read: <T>(v: string): T => JSON.parse(v) as T,
    write: <T>(v: T): string => JSON.stringify(v),
  } satisfies Serializer<unknown>,

  map: {
    read: <K, V>(v: string): Map<K, V> => new Map(JSON.parse(v)),
    write: <K, V>(v: Map<K, V>): string => JSON.stringify([...v.entries()]),
  } satisfies Serializer<Map<unknown, unknown>>,

  set: {
    read: <T>(v: string): Set<T> => new Set(JSON.parse(v)),
    write: <T>(v: Set<T>): string => JSON.stringify([...v]),
  } satisfies Serializer<Set<unknown>>,

  /*
   * Any serializer - fallback that treats everything as string.
   */
  any: {
    read: <T>(v: string): T => v as T,
    write: (v: unknown): string => String(v),
  } satisfies Serializer<unknown>,
} as const;

function resolveSerializer<T>(initialValue: T, options?: StorageOptions<T>): Serializer<T> {
  if (options?.serializer) {
    return options.serializer;
  }
  const type = inferSerializerType(initialValue);
  return Serializers[type] as Serializer<T>;
}

function inferSerializerType<T>(value: T): keyof typeof Serializers {
  if (value === null || value === undefined) {
    return 'any';
  }

  if (value instanceof Map) {
    return 'map';
  }

  if (value instanceof Set) {
    return 'set';
  }

  if (value instanceof Date) {
    return 'date';
  }

  switch (typeof value) {
    case 'string':
      return 'string';
    case 'number':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'bigint':
      return 'bigint';
    case 'object':
      return 'object';
    default:
      return 'any';
  }
}

function storageAvailable(type: 'localStorage' | 'sessionStorage'): boolean {
  let storage: Storage | undefined;

  try {
    storage = window[type];
    const testKey = '__storage_test__';
    storage.setItem(testKey, testKey);
    storage.removeItem(testKey);
    return true;
  } catch (e) {
    return (
      e instanceof DOMException &&
      e.name === 'QuotaExceededError' &&
      storage !== undefined &&
      storage.length !== 0
    );
  }
}

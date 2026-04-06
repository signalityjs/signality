import { type CreateSignalOptions, isSignal, signal, type WritableSignal } from '@angular/core';
import { isPlainObject, proxySignal, setupContext } from '@signality/core/internal';
import { toValue } from '@signality/core/utilities';
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
    const type = options?.type ?? 'local';

    if (isServer || !storageAvailable(type)) {
      return signal(initialValue, options);
    }

    const targetStorage = type === 'local' ? window.localStorage : window.sessionStorage;
    const serializer = resolveSerializer(initialValue, options);

    const processValue = (storedValue: T) => {
      if (options?.mergeResolver) {
        return options.mergeResolver(storedValue, initialValue);
      }

      if (isPlainObject(initialValue)) {
        return { ...initialValue, ...storedValue };
      }

      return storedValue;
    };

    const readValue = (storageKey: string): T => {
      const raw = targetStorage.getItem(storageKey);

      if (raw === null) {
        if (initialValue != null) {
          writeValue(initialValue);
        }
        return initialValue;
      }

      return processValue(serializer.read(raw));
    };

    const dispatchStorageEvent = (
      key: string,
      oldValue: string | null,
      newValue: string | null
    ) => {
      window.dispatchEvent(
        new StorageEvent('storage', {
          key,
          oldValue,
          newValue,
          storageArea: targetStorage,
          url: window.location.href,
        })
      );
    };

    const writeValue = (value: T): void => {
      const storageKey = toValue(key);
      const oldValue = targetStorage.getItem(storageKey);

      if (value == null) {
        targetStorage.removeItem(storageKey);
        dispatchStorageEvent(storageKey, oldValue, null);
      } else {
        const serialized = serializer.write(value);
        if (oldValue !== serialized) {
          targetStorage.setItem(storageKey, serialized);
          dispatchStorageEvent(storageKey, oldValue, serialized);
        }
      }
    };

    const state = signal<T>(readValue(toValue(key)), options);

    setupSync(() => {
      listener(window, 'storage', e => {
        const currKey = toValue(key);

        if (e.key === currKey && e.storageArea === targetStorage) {
          const newValue =
            e.newValue === null ? initialValue : processValue(serializer.read(e.newValue));

          state.set(newValue);
        }
      });
    });

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

function storageAvailable(type: 'local' | 'session'): boolean {
  let storage: Storage | undefined;

  try {
    storage = window[`${type}Storage`];
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

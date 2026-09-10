import {
  type CreateSignalOptions,
  inject,
  InjectionToken,
  isSignal,
  signal,
  type WritableSignal,
} from '@angular/core';
import { isPlainObject, setupContext } from '@signality/core/internal';
import { toValue } from '@signality/core/utilities';
import type { MaybeSignal, WithInjector } from '@signality/core/types';
import { listener, setupSync } from '@signality/core/browser/listener';
import { watcher } from '@signality/core/reactivity/watcher';
import { proxySignal } from '@signality/core/reactivity/proxy-signal';

/**
 * Minimal synchronous storage contract — a structural subset of the
 * [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API).
 *
 * Any object implementing these three methods can back the {@link storage} utility:
 * the built-in `localStorage`/`sessionStorage`, an in-memory store, a cookie-based
 * storage, an encrypting wrapper, etc.
 */
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface StorageOptions<T> extends CreateSignalOptions<T>, WithInjector {
  /**
   * Where to persist the value.
   *
   * - `'local' | 'session'` — the app-wide backend provided by the {@link LOCAL_STORAGE}
   *   or {@link SESSION_STORAGE} DI token
   * - {@link StorageLike} — a custom storage for this call
   * - `null` — persistence disabled, the signal behaves like a plain `signal(initialValue)`
   *
   * @default 'local'
   *
   * @example
   * ```typescript
   * const draft = storage('draft', '', { storage: 'session' });
   * const consent = storage('consent', false, { storage: cookieStorage });
   * ```
   */
  readonly storage?: 'local' | 'session' | StorageLike | null;

  /**
   * Storage type to use.
   *
   * @deprecated Use `storage: 'local' | 'session'` instead. Ignored when the `storage`
   * option is provided. Will be removed before 1.0.
   *
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
 * Custom event dispatched to synchronize `storage` signals within the same
 * document when the underlying storage is not a built-in `Storage` (e.g. a
 * proxied localStorage), because a `StorageEvent` cannot be constructed with a
 * non-built-in `storageArea`.
 */
const STORAGE_EVENT_NAME = 'signality-storage';

interface StorageEventLike {
  readonly key: string | null;
  readonly oldValue: string | null;
  readonly newValue: string | null;
  readonly storageArea: StorageLike | null;
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
 *   storage: 'session',
 * });
 * ```
 *
 * @example
 * With a custom storage — per call via `options.storage`, or app-wide via the
 * {@link LOCAL_STORAGE}/{@link SESSION_STORAGE} DI tokens:
 * ```typescript
 * // Per call
 * const consent = storage('consent', false, { storage: cookieStorage });
 *
 * // App-wide: any object implementing getItem/setItem/removeItem
 * TestBed.configureTestingModule({
 *   providers: [{ provide: LOCAL_STORAGE, useValue: inMemoryStorage }],
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

    const configured = options?.storage !== undefined ? options.storage : options?.type ?? 'local';
    const targetStorage =
      typeof configured === 'string'
        ? inject(configured === 'local' ? LOCAL_STORAGE : SESSION_STORAGE)
        : configured;

    if (!targetStorage) {
      return signal(initialValue, options);
    }

    if (ngDevMode) {
      assertStorageLike(targetStorage, 'storage');
    }

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
      const detail: StorageEventLike = { key, oldValue, newValue, storageArea: targetStorage };
      window.dispatchEvent(new CustomEvent<StorageEventLike>(STORAGE_EVENT_NAME, { detail }));
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

    const source = signal<T>(readValue(toValue(key)), options);

    const syncFromEvent = (event: StorageEventLike): void => {
      const currKey = toValue(key);

      if (event.key === currKey && event.storageArea === targetStorage) {
        const newValue =
          event.newValue === null ? initialValue : processValue(serializer.read(event.newValue));

        source.set(newValue);
      }
    };

    setupSync(() => {
      // cross-document (other tab) changes to a built-in Storage arrive as a
      // native `'storage'` event fired by the browser.
      if (targetStorage instanceof Storage) {
        listener(window, 'storage', syncFromEvent);
      }

      // same-document changes arrive as the CustomEvent dispatched on write.
      listener<CustomEvent<StorageEventLike>>(window, STORAGE_EVENT_NAME, e =>
        syncFromEvent(e.detail)
      );
    });

    if (isSignal(key)) {
      watcher(key, newKey => source.set(readValue(newKey)));
    }

    return proxySignal(
      source,
      {
        set: (value: T) => {
          writeValue(value);
          source.set(value);
        },
      },
      { equal: options?.equal }
    );
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

/**
 * Returns the built-in Web Storage area for the given type, or `null` when it is
 * unavailable (server-side rendering, disabled cookies, Safari private mode).
 * Performs a write/remove probe before handing the storage out.
 */
export function getWebStorage(type: 'local' | 'session'): StorageLike | null {
  if (typeof window === 'undefined') {
    return null;
  }

  let storage: Storage | undefined;

  try {
    storage = window[`${type}Storage`];
    const testKey = '__storage_test__';
    storage.setItem(testKey, testKey);
    storage.removeItem(testKey);
    return storage;
  } catch (e) {
    if (
      e instanceof DOMException &&
      e.name === 'QuotaExceededError' &&
      storage !== undefined &&
      storage.length !== 0
    ) {
      return storage;
    }

    return null;
  }
}

/**
 * DI token providing the {@link StorageLike} backend used by {@link storage} when its
 * `storage` option is `'local'` (the default). Defaults to the built-in `window.localStorage`
 * (see {@link getWebStorage}).
 *
 * @example
 * ```typescript
 * // Testing: any object implementing getItem/setItem/removeItem — no window mocks
 * TestBed.configureTestingModule({
 *   providers: [{ provide: LOCAL_STORAGE, useValue: inMemoryStorage }],
 * });
 *
 * // Encryption at rest: decorate the built-in storage
 * bootstrapApplication(App, {
 *   providers: [
 *     {
 *       provide: LOCAL_STORAGE,
 *       useFactory: () => {
 *         const base = getWebStorage('local');
 *         return base && encryptedStorage(base, SECRET);
 *       },
 *     },
 *   ],
 * });
 * ```
 */
export const LOCAL_STORAGE = new InjectionToken<StorageLike | null>(
  ngDevMode ? 'LOCAL_STORAGE' : '',
  { providedIn: 'root', factory: () => getWebStorage('local') }
);

/**
 * DI token providing the {@link StorageLike} backend used by {@link storage} when its
 * `storage` option is `'session'`. Defaults to the built-in `window.sessionStorage`
 * (see {@link getWebStorage}). See {@link LOCAL_STORAGE} for override examples.
 */
export const SESSION_STORAGE = new InjectionToken<StorageLike | null>(
  ngDevMode ? 'SESSION_STORAGE' : '',
  { providedIn: 'root', factory: () => getWebStorage('session') }
);

function assertStorageLike(value: unknown, source: string): asserts value is StorageLike {
  const target = value as StorageLike | null;

  if (
    !target ||
    typeof target.getItem !== 'function' ||
    typeof target.setItem !== 'function' ||
    typeof target.removeItem !== 'function'
  ) {
    throw new Error(
      `[${source}] Expected a StorageLike implementation with getItem/setItem/removeItem, ` +
        `but received: ${value === null ? 'null' : typeof value}.`
    );
  }
}

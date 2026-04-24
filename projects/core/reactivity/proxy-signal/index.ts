import {
  type CreateSignalOptions,
  type Signal,
  untracked,
  type WritableSignal,
} from '@angular/core';

export interface SignalProxyHandler<T> {
  get?(source: Signal<T>): T;
  set?(value: T, source: WritableSignal<T>): void;
}

/**
 * Creates a proxy wrapper around a {@link WritableSignal} that intercepts get and set operations.
 * The proxy allows transforming values on read and write, composing multiple signal utilities.
 *
 * @param source - Source writable signal to wrap
 * @param handler - Handler object with optional get/set transformations
 * @param options - Optional configuration including custom equality function
 * @returns A writable signal proxy with transformed get/set behavior
 *
 * @example
 * ```typescript
 * import { signal } from '@angular/core';
 * import { proxySignal } from '@signality/core';
 *
 * export function debouncedSignal<T>(initialValue: T, delayMs: number): WritableSignal<T> {
 *   const source = signal(initialValue);
 *
 *   let timeoutId: ReturnType<typeof setTimeout> | null = null;
 *
 *   return proxySignal(source, {
 *     set: value => {
 *       if (timeoutId) clearTimeout(timeoutId);
 *       timeoutId = setTimeout(() => source.set(value), delayMs);
 *     }
 *   });
 * }
 *
 * const searchQuery = debouncedSignal('', 300);
 * searchQuery.set('query');  // actual update after 300ms
 * ```
 */
export function proxySignal<T>(
  source: WritableSignal<T>,
  handler: SignalProxyHandler<T>,
  options?: Pick<CreateSignalOptions<T>, 'equal'>
): WritableSignal<T>;

/**
 * Creates a proxy wrapper around a {@link Signal} that intercepts get operations.
 * The proxy allows transforming values on read only, composing multiple signal utilities.
 *
 * @param source - Source readonly signal to wrap
 * @param handler - Handler object with optional get transformation (set not allowed for readonly)
 * @returns A readonly signal proxy with transformed get behavior
 *
 * @example
 * ```typescript
 * import { signal } from '@angular/core';
 * import { proxySignal } from '@signality/core';
 *
 * export function withDefault<T>(source: Signal<T | undefined>, defaultValue: T): Signal<T> {
 *   return proxySignal(source, {
 *     get: s => s() ?? defaultValue
 *   });
 * }
 *
 * const tab = signal<string | undefined>('home');
 * const safeTab = withDefault(tab, 'default-tab');
 * ```
 */
export function proxySignal<T>(
  source: Signal<T>,
  handler: Omit<SignalProxyHandler<T>, 'set'>
): Signal<T>;

export function proxySignal<T>(
  source: Signal<T> | WritableSignal<T>,
  handler: SignalProxyHandler<T>,
  options?: Pick<CreateSignalOptions<T>, 'equal'>
): WritableSignal<T> | Signal<T> {
  const hooks = writableHooks(source, handler, options);

  return new Proxy(source, {
    apply(target, thisArg, args) {
      return handler.get ? handler.get(target) : Reflect.apply(target, thisArg, args);
    },
    get(target, prop, receiver) {
      return typeof prop === 'string' && prop in hooks
        ? hooks[prop]
        : Reflect.get(target, prop, receiver);
    },
  });
}

function writableHooks<T>(
  source: WritableSignal<T> | Signal<T>,
  handler: SignalProxyHandler<T>,
  options?: Pick<CreateSignalOptions<T>, 'equal'>
): Record<string, ((...args: any[]) => any) | undefined> {
  const isWritable = 'set' in source && typeof source.set === 'function';
  const hooks: Record<string, ((...args: any[]) => any) | undefined> = Object.create(null);

  if (!isWritable) {
    return hooks;
  }

  if (handler.get) {
    const get = handler.get.bind(handler);

    let readonlyFn: Signal<T> | undefined;
    hooks['asReadonly'] = () => {
      return (readonlyFn ??= proxySignal(source.asReadonly(), { get }));
    };

    if (!handler.set) {
      hooks['update'] = (fn: (value: T) => T) => {
        const currentValue = untracked(() => get(source));
        source.set(fn(currentValue));
      };

      return hooks;
    }
  }

  if (handler.set) {
    const equalFn = options?.equal ?? Object.is;
    const valueFn = handler.get ? () => handler.get!(source) : source;

    const set = (value: T) => {
      untracked(() => {
        const currentValue = valueFn();
        if (!equalFn(currentValue, value)) {
          handler.set!(value, source);
        }
      });
    };

    hooks['set'] = set;
    hooks['update'] = (fn: (value: T) => T) => {
      const currentValue = untracked(valueFn);
      set(fn(currentValue));
    };
  }

  return hooks;
}

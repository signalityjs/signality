import {
  type CreateSignalOptions,
  type Signal,
  untracked,
  type WritableSignal,
} from '@angular/core';

export type ProxySignalHandler<T, R = T> =
  | {
      readonly get: (source: Signal<T>) => R;
      readonly set: (value: R, source: WritableSignal<T>) => void;
    }
  | {
      readonly get: (source: Signal<T>) => T;
      readonly set: (value: T, source: WritableSignal<T>) => void;
    }
  | {
      readonly get: (source: Signal<T>) => R;
      readonly set?: never;
    }
  | {
      readonly get?: never;
      readonly set: (value: T, source: WritableSignal<T>) => void;
    }
  | {
      readonly get?: never;
      readonly set?: never;
    };

export function proxySignal<T>(
  source: WritableSignal<T>,
  handler: { get: (source: Signal<T>) => T; set: (value: T, source: WritableSignal<T>) => void },
  options?: Pick<CreateSignalOptions<T>, 'equal'>
): WritableSignal<T>;

export function proxySignal<T, R>(
  source: WritableSignal<T>,
  handler: { get: (source: Signal<T>) => R; set: (value: R, source: WritableSignal<T>) => void },
  options?: Pick<CreateSignalOptions<R>, 'equal'>
): WritableSignal<R>;

export function proxySignal<T>(
  source: WritableSignal<T>,
  handler: { get: (source: Signal<T>) => T; set?: never },
  options?: never
): WritableSignal<T>;

export function proxySignal<T, R>(
  source: Signal<T>,
  handler: { get: (source: Signal<T>) => R; set?: never },
  options?: never
): Signal<R>;

export function proxySignal<T>(
  source: WritableSignal<T>,
  handler: { get?: never; set: (value: T, source: WritableSignal<T>) => void },
  options?: Pick<CreateSignalOptions<T>, 'equal'>
): WritableSignal<T>;

export function proxySignal<T>(
  source: WritableSignal<T>,
  handler: { get?: never; set?: never },
  options?: never
): WritableSignal<T>;

export function proxySignal<T>(
  source: Signal<T>,
  handler: { get?: never; set?: never },
  options?: never
): Signal<T>;

export function proxySignal<T, R = T>(
  source: Signal<T> | WritableSignal<T>,
  handler: ProxySignalHandler<T, R>,
  options?: Pick<CreateSignalOptions<T | R>, 'equal'>
): WritableSignal<R> | Signal<R> {
  const hooks = writableHooks(source, handler, options);

  return new Proxy(source as object, {
    apply(target, thisArg, args) {
      return handler.get
        ? handler.get(target as Signal<T>)
        : Reflect.apply(target as (...a: unknown[]) => unknown, thisArg, args);
    },
    get(target, prop, receiver) {
      return typeof prop === 'string' && prop in hooks
        ? hooks[prop]
        : Reflect.get(target, prop, receiver);
    },
  }) as WritableSignal<R> | Signal<R>;
}

function writableHooks(
  source: WritableSignal<any> | Signal<any>,
  handler: ProxySignalHandler<any, any>,
  options?: Pick<CreateSignalOptions<any>, 'equal'>
): Record<string, ((...args: any[]) => any) | undefined> {
  const isWritable = 'set' in source && typeof source.set === 'function';
  const hooks = Object.create(null);

  if (!isWritable) {
    return hooks;
  }

  if (handler.get) {
    const get = handler.get.bind(handler);

    let readonlyFn: Signal<any> | undefined;
    hooks['asReadonly'] = () => {
      return (readonlyFn ??= proxySignal(source.asReadonly(), { get }));
    };
  }

  if (handler.set) {
    const equalFn = options?.equal ?? Object.is;
    const valueFn = handler.get ? () => handler.get(source) : () => source();

    const set = (value: any) => {
      untracked(() => {
        const currentValue = valueFn();
        if (!equalFn(currentValue, value)) {
          handler.set!(value, source);
        }
      });
    };

    hooks['set'] = set;
    hooks['update'] = (fn: (value: any) => any) => {
      const currentValue = untracked(valueFn);
      set(fn(currentValue));
    };
  }

  return hooks;
}

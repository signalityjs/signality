import {
  type CreateSignalOptions,
  type Signal,
  untracked,
  type WritableSignal,
} from '@angular/core';

export type ProxySignalHandler<T, R = T> =
  | { get: (source: Signal<T>) => R; set?: (value: R, source: WritableSignal<T>) => void }
  | { get?: never; set?: (value: R, source: WritableSignal<T>) => void };

export function proxySignal<T, R>(
  source: WritableSignal<T>,
  handler: { get: (source: Signal<T>) => R; set?: (value: R, source: WritableSignal<T>) => void },
  options?: Pick<CreateSignalOptions<R>, 'equal'>
): WritableSignal<R>;

export function proxySignal<T, R>(
  source: Signal<T>,
  handler: { get: (source: Signal<T>) => R; set?: never },
  options?: Pick<CreateSignalOptions<R>, 'equal'>
): Signal<R>;

export function proxySignal<T>(
  source: WritableSignal<T>,
  handler: { get?: never; set?: (value: T, source: WritableSignal<T>) => void },
  options?: Pick<CreateSignalOptions<T>, 'equal'>
): WritableSignal<T>;

export function proxySignal<T>(
  source: Signal<T>,
  handler: { get?: never; set?: never },
  options?: Pick<CreateSignalOptions<T>, 'equal'>
): Signal<T>;

export function proxySignal<T, R = T>(
  source: Signal<T> | WritableSignal<T>,
  handler: ProxySignalHandler<T, R>,
  options?: Pick<CreateSignalOptions<R>, 'equal'>
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

function writableHooks<T, R>(
  source: WritableSignal<T> | Signal<T>,
  handler: ProxySignalHandler<T, R>,
  options?: Pick<CreateSignalOptions<R>, 'equal'>
): Record<string, ((...args: any[]) => any) | undefined> {
  const isWritable = 'set' in source && typeof source.set === 'function';
  const hooks: Record<string, ((...args: any[]) => any) | undefined> = Object.create(null);

  if (!isWritable) {
    return hooks;
  }

  if (handler.get) {
    const get = handler.get.bind(handler);

    let readonlyFn: Signal<R> | undefined;
    hooks['asReadonly'] = () => {
      return (readonlyFn ??= proxySignal(source.asReadonly(), { get }));
    };

    if (!handler.set) {
      hooks['update'] = (fn: (value: R) => R) => {
        const currentValue = untracked(() => get(source));
        source.set(fn(currentValue) as unknown as T);
      };

      return hooks;
    }
  }

  if (handler.set) {
    const equalFn = options?.equal ?? Object.is;
    const valueFn = handler.get ? () => handler.get!(source) : () => source() as unknown as R;

    const set = (value: R) => {
      untracked(() => {
        const currentValue = valueFn();
        if (!equalFn(currentValue, value)) {
          handler.set!(value, source);
        }
      });
    };

    hooks['set'] = set;
    hooks['update'] = (fn: (value: R) => R) => {
      const currentValue = untracked(valueFn);
      set(fn(currentValue));
    };
  }

  return hooks;
}

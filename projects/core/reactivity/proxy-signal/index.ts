import {
  type CreateSignalOptions,
  type Signal,
  untracked,
  type WritableSignal,
} from '@angular/core';

/**
 * @internal
 */
export interface SignalProxyHandler<T> {
  get?(source: Signal<T>): T;
  set?(value: T, source: WritableSignal<T>): void;
}

/**
 * Creates a proxy wrapper around a {@link WritableSignal}
 * @internal
 */
export function proxySignal<T>(
  source: WritableSignal<T>,
  handler: SignalProxyHandler<T>,
  options?: Pick<CreateSignalOptions<T>, 'equal'>
): WritableSignal<T>;

/**
 * Creates a proxy wrapper around a {@link Signal}
 * @internal
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
  const hooks: Record<string, ((...args: any[]) => any) | undefined> = {};

  if (!isWritable) {
    return hooks;
  }

  if (handler.set) {
    const equal = options?.equal ?? Object.is;
    const set = (value: T) => {
      untracked(() => {
        if (!equal(source(), value)) {
          handler.set!(value, source);
        }
      });
    };

    hooks['set'] = set;
    hooks['update'] = (fn: (value: T) => T) => set(fn(untracked(source)));
  }

  if (handler.get) {
    const get = handler.get!.bind(handler);
    let readonlyFn: Signal<T> | undefined;

    hooks['asReadonly'] = () => (readonlyFn ??= proxySignal(source.asReadonly(), { get }));
  }

  return hooks;
}

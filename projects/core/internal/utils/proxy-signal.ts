import {
  type CreateSignalOptions,
  type Signal,
  untracked,
  type ValueEqualityFn,
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
    // Angular stores the internal SignalNode (which holds `equal`) under [SIGNAL].
    // We try to locate it indirectly via symbol-keyed property scan to avoid
    // a hard dependency on the internal symbol export.
    const sourceSignalNode = Object.getOwnPropertySymbols(source)
      .map(s => (source as any)[s])
      .find((node): node is { equal?: ValueEqualityFn<T> } => typeof node?.equal === 'function');
    const equalFn = options?.equal ?? sourceSignalNode?.equal;

    const set = (value: T) => {
      untracked(() => {
        if (!equalFn?.(source(), value)) {
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

import { type Signal, untracked, type WritableSignal } from '@angular/core';
import { SIGNAL, type SignalNode } from '@angular/core/primitives/signals';

/**
 * @internal
 */
export interface SignalProxyHandler<T> {
  get?(source: Signal<T>): T;
  set?(value: T, source: WritableSignal<T>): void;
}

/**
 * @internal
 * Creates a proxy wrapper around a {@link Signal}
 */
export function proxySignal<T>(
  source: Signal<T>,
  handler: Omit<SignalProxyHandler<T>, 'set'>
): Signal<T>;

/**
 * @internal
 * Creates a proxy wrapper around a {@link WritableSignal}
 */
export function proxySignal<T>(
  source: WritableSignal<T>,
  handler: SignalProxyHandler<T>
): WritableSignal<T>;

export function proxySignal<T>(
  source: Signal<T> | WritableSignal<T>,
  handler: SignalProxyHandler<T>
): Signal<T> | WritableSignal<T> {
  const node = source[SIGNAL] as SignalNode<T>;
  const isWritable = 'set' in source && typeof source.set === 'function';

  const proxy = (handler.get ? () => handler.get!(source) : () => source()) as Signal<T>;

  proxy[SIGNAL] = node;

  // @TODO: consider (original toString internally reads from the original getter, bypassing the proxy)
  proxy.toString = source.toString;

  if (isWritable) {
    const set = handler.set
      ? (value: T) => untracked(() => handler.set!(value, source))
      : (value: T) => source.set(value);

    const update = (updater: (current: T) => T) => set(updater(node.value));

    (proxy as WritableSignal<T>).set = set;
    (proxy as WritableSignal<T>).update = update;
    (proxy as WritableSignal<T>).asReadonly = () => {
      const getter = source.asReadonly();
      return proxySignal(getter, { get: handler.get?.bind(handler) });
    };
  }

  return proxy;
}

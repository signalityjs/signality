import type { Signal } from '@angular/core';
import {
  SIGNAL,
  SIGNAL_NODE,
  type SignalGetter,
  type SignalNode,
} from '@angular/core/primitives/signals';

/**
 * @internal
 *
 * Creates a lightweight, readonly signal.
 * This is primarily used to provide fallback values for states that cannot be
 * computed in the current environment. For example:
 * - During SSR where browser-only APIs are unavailable
 * - In environments that lack support for specific APIs
 */
export function constSignal<T>(value: T): Signal<T> {
  const node: SignalNode<T> = Object.create(SIGNAL_NODE);
  node.value = value;

  const getter = (() => node.value) as SignalGetter<T>;
  (getter as any)[SIGNAL] = node;

  if (typeof ngDevMode !== 'undefined' && ngDevMode) {
    const debugName = node.debugName ? ' (' + node.debugName + ')' : '';
    getter.toString = () => `[Signal${debugName}: ${String(node.value)}]`;
  }

  return getter;
}

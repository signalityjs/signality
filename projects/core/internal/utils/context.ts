import {
  assertInInjectionContext,
  DestroyRef,
  inject,
  type Injector,
  INJECTOR,
  isSignal,
  runInInjectionContext,
  type Signal,
  untracked,
} from '@angular/core';
import { SIGNAL, type SignalNode } from '@angular/core/primitives/signals';
import { IS_BROWSER, IS_MOBILE, IS_SERVER } from '../providers';

export interface ContextRef {
  readonly injector: Injector;
  readonly isServer: boolean;
  readonly isBrowser: boolean;
  readonly isMobile: boolean;
  readonly onCleanup: (cleanupFn: () => void) => void;
}

export interface SetupContextRef {
  runInContext<T>(fn: (context: ContextRef) => T): T;
}

/**
 * @internal
 *
 * @param injector - injector to use for context
 * @param debugFn - context owner function
 */
export function setupContext(
  injector?: Injector,
  debugFn?: (...args: any[]) => any
): SetupContextRef {
  if (typeof ngDevMode !== 'undefined' && ngDevMode && !injector) {
    assertInInjectionContext(debugFn || setupContext);
  }

  const ctxInjector = injector || inject(INJECTOR);

  return {
    runInContext<T>(fn: (context: ContextRef) => T): T {
      return runInContextImpl(fn, ctxInjector, debugFn || setupContext);
    },
  };
}

function runInContextImpl<T>(
  fn: (context: ContextRef) => T,
  injector: Injector,
  debugFn: (...args: any[]) => any
): T {
  const result = runInInjectionContext(injector, () => {
    const isBrowser = inject(IS_BROWSER);
    const isServer = inject(IS_SERVER);
    const isMobile = inject(IS_MOBILE);
    const destroyRef = inject(DestroyRef);

    const onCleanup = (cleanupFn: () => void) => {
      destroyRef.onDestroy(cleanupFn);
    };

    return untracked(() => fn({ injector, isBrowser, isServer, isMobile, onCleanup }));
  });

  if (typeof ngDevMode !== 'undefined' && ngDevMode && result != null) {
    setupDebugInfo(result, debugFn);
  }

  return result;
}

function setupDebugInfo<T>(value: T, debugFn: (...args: any[]) => any): T {
  if (isSignal(value)) {
    setDebugName(value, debugFn);
  } else if (value && typeof value === 'object') {
    for (const [postfix, maybeSignal] of Object.entries(value)) {
      if (isSignal(maybeSignal)) {
        setDebugName(maybeSignal, debugFn, postfix);
      }
    }
  }

  return value;
}

function setDebugName(
  signal: Signal<unknown>,
  debugFn: (...args: any[]) => any,
  postfix?: string
): void {
  const node = signal[SIGNAL] as SignalNode<unknown>;

  if (node.debugName === undefined) {
    node.debugName = debugFn.name + (postfix ? '.' + postfix : '');
  }
}

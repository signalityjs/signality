import {
  assertInInjectionContext,
  DestroyRef,
  inject,
  type Injector,
  INJECTOR,
  runInInjectionContext,
  untracked,
} from '@angular/core';
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
  if (ngDevMode && !injector) {
    assertInInjectionContext(debugFn || setupContext);
  }

  const ctxInjector = injector || inject(INJECTOR);

  return {
    runInContext<T>(fn: (context: ContextRef) => T): T {
      return runInContextImpl(fn, ctxInjector);
    },
  };
}

function runInContextImpl<T>(fn: (context: ContextRef) => T, injector: Injector): T {
  return runInInjectionContext(injector, () => {
    const isBrowser = inject(IS_BROWSER);
    const isServer = inject(IS_SERVER);
    const isMobile = inject(IS_MOBILE);
    const destroyRef = inject(DestroyRef);

    const onCleanup = (cleanupFn: () => void) => {
      destroyRef.onDestroy(cleanupFn);
    };

    return untracked(() => fn({ injector, isBrowser, isServer, isMobile, onCleanup }));
  });
}

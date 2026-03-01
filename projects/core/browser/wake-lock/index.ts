import { computed, effect, inject, type Signal, signal, untracked } from '@angular/core';
import { constSignal, NOOP_ASYNC_FN, setupContext } from '@signality/core/internal';
import type { WithInjector } from '@signality/core/types';
import { listener, type ListenerRef, setupSync } from '@signality/core/browser/listener';
import { PAGE_VISIBILITY } from '@signality/core/browser/page-visibility';

export interface WakeLockOptions extends WithInjector {
  /** Whether to automatically reacquire wake lock when document becomes visible */
  readonly autoReacquire?: boolean;
}

export interface WakeLockRef {
  /** Whether Screen Wake Lock API is supported */
  readonly isSupported: Signal<boolean>;

  /** Whether wake lock is currently active */
  readonly isActive: Signal<boolean>;

  /** Current wake lock sentinel */
  readonly sentinel: Signal<WakeLockSentinel | null>;

  /** Request a wake lock */
  readonly request: () => Promise<void>;

  /** Force request a wake lock (releases existing one first) */
  readonly forceRequest: () => Promise<void>;

  /** Release the wake lock */
  readonly release: () => Promise<void>;
}

/**
 * Signal-based wrapper around the [Screen Wake Lock API](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API).
 *
 * @param options - Optional configuration
 * @returns A WakeLockRef with isSupported, isActive, sentinel signals and control methods
 *
 * @example
 * ```typescript
 * const wakeLock = wakeLock();
 *
 * if (wakeLock.isSupported()) {
 *   await wakeLock.request();
 *   // Screen will stay awake
 * }
 * ```
 */
export function wakeLock(options?: WakeLockOptions): WakeLockRef {
  const { runInContext } = setupContext(options?.injector, wakeLock);

  return runInContext(({ isBrowser, onCleanup, injector }) => {
    const sentinel = signal<WakeLockSentinel | null>(null);
    const requestedType = signal<'screen' | false>(false);

    const isSupported = constSignal(
      isBrowser &&
        'wakeLock' in navigator &&
        typeof (navigator as NavigatorWithWakeLock).wakeLock?.request === 'function'
    );

    if (!isSupported()) {
      return {
        isSupported,
        isActive: constSignal(false),
        sentinel: sentinel.asReadonly(),
        request: NOOP_ASYNC_FN,
        forceRequest: NOOP_ASYNC_FN,
        release: NOOP_ASYNC_FN,
      };
    }

    const visibility = inject(PAGE_VISIBILITY);

    const { autoReacquire = true } = options ?? {};

    const isActive = computed(() => {
      const s = sentinel();
      return !!s && !s.released && visibility() === 'visible';
    });

    let listenerRef: ListenerRef | null = null;

    const forceRequest = async (): Promise<void> => {
      try {
        const currentSentinel = untracked(sentinel);

        if (currentSentinel) {
          if (listenerRef) {
            listenerRef.destroy();
            listenerRef = null;
          }

          if (!currentSentinel.released) {
            await currentSentinel.release();
          }
        }

        if (untracked(visibility) === 'visible') {
          const newSentinel = await (navigator as NavigatorWithWakeLock).wakeLock.request('screen');

          sentinel.set(newSentinel);

          listenerRef = setupSync(() =>
            listener(
              newSentinel,
              'release',
              () => {
                requestedType.set(false);
                sentinel.set(null);
                listenerRef = null;
              },
              { injector }
            )
          );
        }
      } catch (err) {
        sentinel.set(null);
        requestedType.set(false);

        if (listenerRef) {
          listenerRef = null;
        }

        throw err;
      }
    };

    const request = async (): Promise<void> => {
      if (untracked(visibility) === 'visible') {
        await forceRequest();
      } else {
        requestedType.set('screen');
      }
    };

    const release = async (): Promise<void> => {
      requestedType.set(false);

      const currentSentinel = untracked(sentinel);

      sentinel.set(null);

      if (currentSentinel) {
        if (listenerRef) {
          listenerRef.destroy();
          listenerRef = null;
        }
        if (!currentSentinel.released) {
          try {
            await currentSentinel.release();
          } catch (err) {
            if (ngDevMode) {
              console.warn('[wakeLock] Failed to release wake lock.', err);
            }
          }
        }
      }
    };

    if (autoReacquire) {
      effect(() => {
        const isVisible = visibility() === 'visible';
        const pendingType = requestedType();

        if (isVisible && pendingType) {
          requestedType.set(false);
          forceRequest().catch(() => {
            /* ignore errors, will retry on next visibility change */
          });
        }
      });
    }

    onCleanup(() => {
      const currentSentinel = sentinel();
      if (currentSentinel) {
        if (listenerRef) {
          listenerRef.destroy();
          listenerRef = null;
        }
        if (!currentSentinel.released) {
          currentSentinel.release().catch(() => {
            /* ignore errors */
          });
        }
      }
    });

    return {
      isSupported,
      isActive,
      sentinel: sentinel.asReadonly(),
      request,
      forceRequest,
      release,
    };
  });
}

interface NavigatorWithWakeLock extends Navigator {
  readonly wakeLock: {
    readonly request: (type: 'screen') => Promise<WakeLockSentinel>;
  };
}

import { isSignal, type Signal, signal, untracked } from '@angular/core';
import { constSignal, NOOP_FN, setupContext, toValue } from '@signality/core/internal';
import type { MaybeSignal, WithInjector } from '@signality/core/types';
import { watcher } from '@signality/core/reactivity/watcher';

export interface WebWorkerOptions extends WithInjector {
  /**
   * Worker type.
   * @default 'classic'
   */
  readonly type?: 'classic' | 'module';

  /**
   * Credentials mode.
   */
  readonly credentials?: RequestCredentials;

  /**
   * Worker name for debugging.
   */
  readonly name?: string;
}

export interface WebWorkerRef<I, O> {
  /** Last message received from worker */
  readonly data: Signal<O | undefined>;

  /** Whether worker is ready */
  readonly isReady: Signal<boolean>;

  /** Last error from worker */
  readonly error: Signal<Error | null>;

  /** Send message to worker */
  readonly post: (data: I) => void;

  /** Terminate the worker */
  readonly terminate: () => void;
}

/**
 * Signal-based wrapper around the Web Workers API.
 *
 * @param url - Worker script URL
 * @param options - Optional configuration
 * @returns A WebWorkerRef with data signal and control methods
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     <button (click)="worker.post(42)">Calculate</button>
 *     @if (worker.data()) {
 *       <p>Result: {{ worker.data() }}</p>
 *     }
 *   `
 * })
 * class WorkerComponent {
 *   readonly worker = webWorker<number, number>('/workers/calc.js');
 * }
 * ```
 */
export function webWorker<I, O>(
  url: MaybeSignal<string | URL>,
  options?: WebWorkerOptions
): WebWorkerRef<I, O> {
  const { runInContext } = setupContext(options?.injector, webWorker);

  return runInContext(({ isServer, onCleanup }) => {
    if (isServer) {
      return {
        data: constSignal(undefined),
        isReady: constSignal(false),
        error: constSignal(null),
        post: NOOP_FN,
        terminate: NOOP_FN,
      };
    }

    const type = options?.type ?? 'classic';
    const credentials = options?.credentials;
    const name = options?.name;

    const data = signal<O | undefined>(undefined);
    const isReady = signal(false);
    const error = signal<Error | null>(null);

    let worker: Worker | null = null;

    const createWorker = (workerUrl: string | URL) => {
      if (worker) {
        worker.terminate();
      }

      try {
        worker = new Worker(workerUrl, { type, credentials, name });

        worker.onmessage = (event: MessageEvent<O>) => {
          data.set(event.data);
        };

        worker.onerror = (event: ErrorEvent) => {
          error.set(new Error(event.message));
        };

        worker.onmessageerror = () => {
          error.set(new Error('Message deserialization error'));
        };

        isReady.set(true);
      } catch (e) {
        error.set(e as Error);
        isReady.set(false);
      }
    };

    const post = (message: I) => {
      if (worker && untracked(isReady)) {
        try {
          worker.postMessage(message);
        } catch (e) {
          error.set(e as Error);
        }
      }
    };

    const terminate = () => {
      if (worker) {
        worker.terminate();
        worker = null;
        isReady.set(false);
      }
    };

    if (isSignal(url)) {
      watcher(url, createWorker);
    }

    onCleanup(terminate);

    createWorker(toValue(url));

    return {
      data: data.asReadonly(),
      isReady: isReady.asReadonly(),
      error: error.asReadonly(),
      post,
      terminate,
    };
  });
}

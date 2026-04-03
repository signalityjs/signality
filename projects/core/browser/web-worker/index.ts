import { isSignal, type Signal, signal, untracked } from '@angular/core';
import { constSignal, NOOP_FN, setupContext } from '@signality/core/internal';
import { toValue } from '@signality/core/utilities';
import type { MaybeSignal, WithInjector } from '@signality/core/types';
import { watcher } from '@signality/core/reactivity/watcher';

export interface WebWorkerOptions extends WithInjector {
  /**
   * Worker script type.
   *
   * @default 'classic'
   * @see [Worker: Worker() constructor — type on MDN](https://developer.mozilla.org/en-US/docs/Web/API/Worker/Worker#type)
   */
  readonly type?: 'classic' | 'module';

  /**
   * Credentials mode used when fetching the worker script.
   *
   * @see [Worker: Worker() constructor — credentials on MDN](https://developer.mozilla.org/en-US/docs/Web/API/Worker/Worker#credentials)
   */
  readonly credentials?: RequestCredentials;

  /**
   * Identifying name for the worker, useful for debugging in DevTools.
   *
   * @see [Worker: Worker() constructor — name on MDN](https://developer.mozilla.org/en-US/docs/Web/API/Worker/Worker#name)
   */
  readonly name?: string;
}

export interface WebWorkerRef<I, O> {
  /**
   * The last message received from the worker via `postMessage`.
   * `undefined` until the first message is received.
   */
  readonly data: Signal<O | undefined>;

  /**
   * Whether the worker has been successfully created and is ready to receive messages.
   */
  readonly isReady: Signal<boolean>;

  /**
   * The last error emitted by the worker, or `null` if no error has occurred.
   */
  readonly error: Signal<Error | null>;

  /**
   * Send a message to the worker.
   *
   * @see [Worker.postMessage() on MDN](https://developer.mozilla.org/en-US/docs/Web/API/Worker/postMessage)
   */
  readonly post: (data: I) => void;

  /**
   * Terminate the worker immediately, discarding any pending messages.
   *
   * @see [Worker.terminate() on MDN](https://developer.mozilla.org/en-US/docs/Web/API/Worker/terminate)
   */
  readonly terminate: () => void;
}

/**
 * Signal-based wrapper around the [Web Workers API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API).
 * Run scripts in background threads without blocking the main thread.
 *
 * When `url` is a signal, the worker is automatically recreated whenever the URL changes.
 *
 * @param url - Worker script URL (static or reactive signal)
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
 * export class WorkerDemo {
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

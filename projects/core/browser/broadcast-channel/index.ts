import { type Signal, signal } from '@angular/core';
import { constSignal, NOOP_FN, setupContext } from '@signality/core/internal';
import type { WithInjector } from '@signality/core/types';
import { listener, setupSync } from '@signality/core/browser/listener';

export type BroadcastChannelOptions = WithInjector;

export interface BroadcastChannelRef<T> {
  /** Last received data */
  readonly data: Signal<T | null>;

  /** The last error that occurred */
  readonly error: Signal<MessageEvent | null>;

  /** Whether the channel is closed */
  readonly isClosed: Signal<boolean>;

  /** Send a message to all tabs */
  readonly post: (data: T) => void;

  /** Close the channel */
  readonly close: () => void;
}

/**
 * Signal-based wrapper around the [Broadcast Channel API](https://developer.mozilla.org/en-US/docs/Web/API/Broadcast_Channel_API).
 *
 * @param name - Channel name (must match across tabs)
 * @param options - Optional configuration
 * @returns A BroadcastChannelRef with data signal and control methods
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     @if (channel.data(); as data) {
 *       <p>Received: {{ data }}</p>
 *     }
 *     <button (click)="sendMessage()">Send Message</button>
 *   `
 * })
 * export class ChatDemo {
 *   readonly channel = broadcastChannel<string>('my-channel');
 *
 *   sendMessage() {
 *     this.channel.post('Hello from this tab!');
 *   }
 * }
 * ```
 */
export function broadcastChannel<T>(
  name: string,
  options?: BroadcastChannelOptions
): BroadcastChannelRef<T> {
  const { runInContext } = setupContext(options?.injector, broadcastChannel);

  return runInContext(({ isServer, onCleanup }) => {
    if (isServer) {
      return {
        data: constSignal(null),
        error: constSignal(null),
        isClosed: constSignal(false),
        post: NOOP_FN,
        close: NOOP_FN,
      };
    }

    const data = signal<T | null>(null);
    const error = signal<MessageEvent | null>(null);
    const isClosed = signal(false);

    const channel = new BroadcastChannel(name);

    const post = (message: T) => {
      channel.postMessage(message);
    };

    const close = () => {
      channel.close();
      isClosed.set(true);
    };

    setupSync(() => {
      listener(channel, 'message', e => data.set(e.data));
      listener(channel, 'messageerror', error.set);
    });

    onCleanup(close);

    return {
      data: data.asReadonly(),
      error: error.asReadonly(),
      isClosed: isClosed.asReadonly(),
      post,
      close,
    };
  });
}

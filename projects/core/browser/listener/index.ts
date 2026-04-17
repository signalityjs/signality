import {
  afterRenderEffect,
  EffectCleanupFn,
  type EffectCleanupRegisterFn,
  isSignal,
  untracked,
} from '@angular/core';
import {
  assertEventTarget,
  NOOP_EFFECT_REF,
  setupContext,
  unrefElement,
} from '@signality/core/internal';
import { toValue } from '@signality/core/utilities';
import type { MaybeElementSignal, MaybeSignal, WithInjector } from '@signality/core/types';

export type ListenerOptions = WithInjector;

export interface ListenerRef {
  readonly destroy: () => void;
}

export interface ListenerFunction {
  <E extends keyof WindowEventMap>(
    target: Window,
    event: MaybeSignal<E>,
    handler: (this: Window, e: WindowEventMap[E]) => any,
    options?: ListenerOptions
  ): ListenerRef;

  <E extends keyof DocumentEventMap>(
    target: Document,
    event: MaybeSignal<E>,
    handler: (this: Document, e: DocumentEventMap[E]) => any,
    options?: ListenerOptions
  ): ListenerRef;

  <E extends keyof ShadowRootEventMap>(
    target: MaybeSignal<ShadowRoot>,
    event: MaybeSignal<E>,
    handler: (this: ShadowRoot, e: ShadowRootEventMap[E]) => any,
    options?: ListenerOptions
  ): ListenerRef;

  <T extends HTMLElement, E extends keyof HTMLElementEventMap>(
    target: MaybeElementSignal<T>,
    event: MaybeSignal<E>,
    handler: (this: T, e: HTMLElementEventMap[E]) => any,
    options?: ListenerOptions
  ): ListenerRef;

  <T extends SVGElement, E extends keyof SVGElementEventMap>(
    target: MaybeElementSignal<T>,
    event: MaybeSignal<E>,
    handler: (this: T, e: SVGElementEventMap[E]) => any,
    options?: ListenerOptions
  ): ListenerRef;

  <Names extends string>(
    target: MaybeSignal<InferEventTarget<Names>>,
    event: MaybeSignal<Names>,
    handler: (e: Event) => void,
    options?: ListenerOptions
  ): ListenerRef;

  <E extends string>(
    target: MaybeSignal<MediaQueryList>,
    event: MaybeSignal<E>,
    handler: (this: MediaQueryList, e: MediaQueryListEvent) => any,
    options?: ListenerOptions
  ): ListenerRef;

  <EventType = Event>(
    target: MaybeSignal<EventTarget> | MaybeElementSignal<Element>,
    event: MaybeSignal<string>,
    handler: GeneralEventListener<EventType>,
    options?: ListenerOptions
  ): ListenerRef;

  readonly capture: ListenerFunction;
  readonly passive: ListenerFunction;
  readonly once: ListenerFunction;
  readonly stop: ListenerFunction;
  readonly prevent: ListenerFunction;
  readonly self: ListenerFunction;
}

/**
 * Signal-based wrapper around the [addEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener) method.
 *
 * @param target - Event target
 * @param event - Event type name
 * @param handler - Event handler function
 * @param options - Optional listener configuration
 * @returns A ListenerRef that can be used to destroy the listener
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `<button #btn>Click me</button>`,
 * })
 * export class ListenerDemo {
 *   readonly btn = viewChild<ElementRef>('btn');
 *
 *   constructor() {
 *     listener.capture.prevent(this.btn, 'click', event => {
 *       console.log('Button clicked!', event);
 *     });
 *   }
 * }
 * ```
 */
export const listener: ListenerFunction = createModifier({});

let isSyncSetupRequired = false;

/**
 * By default, `listener()` registers event listeners after the render cycle completes
 * to ensure DOM elements exist. However, global targets (window, document, navigator.*, etc.)
 * are not tied to the render cycle. Use `setupSync()` to wrap listener calls when you need to prevent
 * race conditions where a global event is dispatched before Angular completes its scheduled rendering tasks.
 */
export function setupSync<T>(listenerFactoryExecFn: () => T): T {
  isSyncSetupRequired = true;

  try {
    return listenerFactoryExecFn();
  } finally {
    isSyncSetupRequired = false;
  }
}

function listenerImpl(applied: InternalListenerOptions, ...args: any[]): ListenerRef {
  const options = args[3] as ListenerOptions | undefined;

  const { runInContext } = setupContext(options?.injector, listenerImpl);

  return runInContext(({ isServer, onCleanup }) => {
    if (isServer) {
      return NOOP_EFFECT_REF;
    }

    const [maybeReactiveTarget, maybeReactiveEvent, rawHandler] = args;
    const { stop, prevent, self, ...nativeOptions } = applied;
    const hasModifiers = stop || prevent || self;

    const handler = hasModifiers
      ? function (this: any, event: Event) {
          if (self && event.target !== event.currentTarget) return;
          if (prevent) event.preventDefault();
          if (stop) event.stopPropagation();
          rawHandler.call(this, event);
        }
      : rawHandler;

    // Isolate event handler from signal dependency tracking.
    // Angular's template compiler does this via setActiveConsumer(null) in executeListenerWithErrorHandling.
    // Without this, events that fire during change detection (e.g. window 'blur' when the tab loses focus)
    // can trigger NG0600 if the handler writes to a signal while a reactive consumer is active.
    // See: https://github.com/angular/angular/issues/60143
    const untrackedHandler = function (this: any, event: Event) {
      untracked(() => handler.call(this, event));
    };

    const setupListener = (onCleanup: EffectCleanupRegisterFn) => {
      const raw = toValue(maybeReactiveTarget);
      const target = unrefElement(raw);
      const event = toValue(maybeReactiveEvent);

      if (!target) {
        return;
      }

      if (ngDevMode) {
        assertEventTarget(target, 'listener');
      }

      target.addEventListener(event, untrackedHandler, nativeOptions);

      onCleanup(() => {
        target.removeEventListener(event, untrackedHandler, nativeOptions);
      });
    };

    if (isSyncSetupRequired) {
      let cleanupFn: EffectCleanupFn | null = null;

      const destroy = () => cleanupFn?.();
      const reactiveConsumerNeeded = isSignal(maybeReactiveTarget) || isSignal(maybeReactiveEvent);

      setupListener(fn => (cleanupFn = fn));

      onCleanup(destroy);

      if (!reactiveConsumerNeeded) {
        return { destroy };
      }
    }

    const effectRef = afterRenderEffect({ read: setupListener });

    return { destroy: () => effectRef.destroy() };
  });
}

const MODIFIERS = new Set<keyof InternalListenerOptions>([
  'capture',
  'passive',
  'once',
  'stop',
  'prevent',
  'self',
]);

function createModifier(applied: InternalListenerOptions): ListenerFunction {
  const modifierFn = ((...args: any[]) => {
    return listenerImpl(applied, ...args);
  }) as ListenerFunction;

  return new Proxy(modifierFn, {
    get(target, prop) {
      if (typeof prop !== 'string' || !MODIFIERS.has(prop as any)) {
        return target[prop as keyof typeof target];
      }

      if (applied[prop as keyof InternalListenerOptions]) {
        return target;
      }

      return createModifier({ ...applied, [prop]: true });
    },
  });
}

interface InternalListenerOptions {
  readonly capture?: boolean;
  readonly passive?: boolean;
  readonly once?: boolean;
  readonly stop?: boolean;
  readonly prevent?: boolean;
  readonly self?: boolean;
}

interface InferEventTarget<Events> {
  readonly addEventListener: (event: Events, fn?: any, options?: any) => any;
  readonly removeEventListener: (event: Events, fn?: any, options?: any) => any;
}

interface GeneralEventListener<E = Event> {
  (e: E): void;
}

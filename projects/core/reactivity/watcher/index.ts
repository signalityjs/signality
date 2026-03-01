import {
  type CreateEffectOptions,
  effect,
  type EffectCleanupRegisterFn,
  type EffectRef,
  type Signal,
  untracked,
} from '@angular/core';
import { setupContext } from '@signality/core/internal';
import type { SignalValues } from '@signality/core/types';

export interface CreateWatcherOptions extends Omit<CreateEffectOptions, 'allowSignalWrites'> {
  /**
   * If `true`, the watcher will automatically destroy itself after the first change.
   * @default false
   */
  readonly once?: boolean;
}

export type WatcherRef = EffectRef;

/**
 * Watches a single signal and calls a callback when it changes, skipping the initial call.
 * Unlike `effect()`, this responds to the fact of state change, enabling event-like orchestration of side effects.
 *
 * @param source - Signal to watch
 * @param fn - Callback function called when signal changes. Receives current value, previous value, and cleanup function
 * @param options - Optional configuration including effect options and injector
 * @returns A WatcherRef (alias for EffectRef) that can be used to manually destroy the watcher
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     <button (click)="count.set(count() + 1)">Count: {{ count() }}</button>
 *   `
 * })
 * class CounterComponent {
 *   readonly count = signal(0);
 *
 *   constructor() {
 *     watcher(this.count, (curr, prev) => {
 *       console.log('Count changed from', prev, 'to', curr);
 *     });
 *   }
 * }
 * ```
 */
export function watcher<V>(
  source: Signal<V>,
  fn: (curr: V, prev: V, onCleanup: EffectCleanupRegisterFn) => void,
  options?: CreateWatcherOptions
): WatcherRef;

/**
 * Watches multiple signals and calls a callback when any of them changes, skipping the initial call.
 * Unlike `effect()`, this responds to the fact of state change, enabling event-like orchestration of side effects.
 *
 * @param sources - Array of signals to watch
 * @param fn - Callback function called when any signal changes. Receives current values array, previous values array, and cleanup function
 * @param options - Optional configuration including effect options and injector
 * @returns A WatcherRef (alias for EffectRef) that can be used to manually destroy the watcher
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     <input [(ngModel)]="name" />
 *     <input [(ngModel)]="age" type="number" />
 *   `
 * })
 * class UserComponent {
 *   readonly name = signal('John');
 *   readonly age = signal(25);
 *
 *   constructor() {
 *     watcher([this.name, this.age], ([name, age], [prevName, prevAge]) => {
 *       console.log('User changed:', { name, age });
 *     });
 *   }
 * }
 * ```
 */
export function watcher<T extends readonly Signal<any>[]>(
  sources: T,
  fn: (curr: SignalValues<T>, prev: SignalValues<T>, onCleanup: EffectCleanupRegisterFn) => void,
  options?: CreateWatcherOptions
): WatcherRef;

export function watcher<V, T extends readonly Signal<any>[]>(
  sourceOrSources: Signal<V> | T,
  fn:
    | ((curr: V, prev: V, onCleanup: EffectCleanupRegisterFn) => void)
    | ((curr: SignalValues<T>, prev: SignalValues<T>, onCleanup: EffectCleanupRegisterFn) => void),
  options?: CreateWatcherOptions
): WatcherRef {
  const { runInContext } = setupContext(options?.injector, watcher);

  return runInContext(() => {
    const isArray = Array.isArray(sourceOrSources);
    const deps = isArray ? (sourceOrSources as Signal<any>[]) : [sourceOrSources as Signal<V>];
    const once = options?.once ?? false;

    let isFirstRun = true;
    let prevValues: readonly any[] | null = null;

    const effectRef = effect(onCleanup => {
      const currValues = deps.map(track => track());

      if (isFirstRun) {
        isFirstRun = false;
        prevValues = currValues;
        return;
      }

      const currentValue = isArray ? currValues : currValues[0];
      const previousValue = isArray ? prevValues : prevValues?.[0];

      prevValues = currValues;

      untracked(() => fn(currentValue, previousValue, onCleanup));

      if (once) {
        effectRef.destroy();
      }
    }, options);

    return effectRef;
  });
}

import type { MaybeSignal, WithInjector } from '@signality/core/types';
import { setupContext, type Timer, toValue } from '@signality/core/internal';

/**
 * Creates a debounced version of a callback function.
 * The callback will only be executed after the specified wait time has elapsed since the last invocation.
 *
 * @param callback - The function to debounce
 * @param wait - Debounce delay in milliseconds (can be a reactive signal)
 * @param options - Optional configuration including injector
 * @returns A debounced version of the callback function
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     <input (input)="handleInput($event.target.value)" />
 *   `,
 * })
 * export class SearchInput {
 *   readonly debounceTime = input(300);
 *   readonly searchChange = output<string>();
 *
 *   readonly handleInput = debounceCallback(value => {
 *     this.searchChange.emit(value);
 *   }, this.debounceTime);
 * }
 * ```
 */
export function debounceCallback<T extends (...args: any[]) => any>(
  callback: T,
  wait: MaybeSignal<number>,
  options?: WithInjector
): T {
  const { runInContext } = setupContext(options?.injector, debounceCallback);

  return runInContext(({ isServer, onCleanup }) => {
    if (isServer) {
      return callback;
    }

    let timer: Timer;

    onCleanup(() => {
      if (timer !== undefined) {
        clearTimeout(timer);
      }
    });

    return new Proxy(callback, {
      apply(target, thisArg, args) {
        if (timer !== undefined) {
          clearTimeout(timer);
        }
        timer = setTimeout(() => {
          target.apply(thisArg, args);
        }, toValue.untracked(wait));
      },
    });
  });
}

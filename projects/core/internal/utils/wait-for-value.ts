import { effect, type Injector, type Signal } from '@angular/core';
import { setupContext } from './context';

/**
 * Resolves the first available value of a signal as a Promise.
 * @internal
 */
export function waitForValue<T>(source: Signal<T>, injector?: Injector): Promise<T> {
  const { runInContext } = setupContext(injector, waitForValue);

  return runInContext(() => {
    try {
      // Try to read the signal synchronously
      return Promise.resolve(source());
    } catch {
      // Required signals (input, model, queries) throw when read outside a reactive context
      // during initialization, fall back to reading the value inside an effect
      return new Promise<T>((resolve, reject) => {
        const effectRef = effect(() => {
          try {
            const value = source();
            resolve(value);
          } catch (e) {
            reject(e);
          } finally {
            effectRef.destroy();
          }
        });
      });
    }
  });
}

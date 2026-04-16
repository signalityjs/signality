import { inject, InjectionToken, InjectOptions, isDevMode, Provider } from '@angular/core';
import { setupContext } from '@signality/core/internal';
import type { WithInjector } from '@signality/core/types';

interface InjectFn<Return> {
  (options?: Omit<InjectOptions, 'optional'> & WithInjector): Return;
  (options?: InjectOptions & WithInjector): Return | null;
}

type ProvideFn<Arguments extends any[]> = (...args: Arguments) => Provider;

export type CreateInjectableReturn<Arguments extends any[], InjectReturn> = Readonly<
  [
    injectFn: InjectFn<InjectReturn>,
    provideFn: ProvideFn<Arguments>,
    injectionToken: InjectionToken<InjectReturn>
  ]
>;

export type InjectedType<T> = T extends CreateInjectableReturn<any[], infer R> ? R : never;

type Factory<Arguments extends any[], Return> = (...args: Arguments) => Return;

type RootArguments<Arguments extends any[]> = { [K in keyof Arguments]: Arguments[K] | undefined };

export interface CreateInjectableFn {
  /**
   * Creates a set of utility functions to manage Angular dependency injection in a typed and simplified way.
   *
   * @param description - A descriptive label for the InjectionToken (useful for debugging).
   * @param factory - A factory function that defines the logic and content of the injectable.
   *
   * @returns A tuple containing:
   * - `injectFn`: A function to retrieve the instance (equivalent to `inject(Token)`).
   * - `provideFn`: A function to provide the injectable in a `providers` array.
   * - `injectionToken`: The underlying `InjectionToken`.
   *
   * @example
   * ```typescript
   * export const [injectCounter, provideCounter] = createInjectable('Counter', (initialValue: number = 0) => {
   *   const count = signal(initialValue);
   *   return { count, inc: () => count.update(v => v + 1) };
   * });
   *
   * @Component({
   *   providers: [provideCounter(10)]
   * })
   * export class MyComponent {
   *   private counter = injectCounter();
   * }
   * ```
   */
  <Arguments extends any[], Return>(
    description: string,
    factory: Factory<Arguments, Return>
  ): CreateInjectableReturn<Arguments, Return>;

  /**
   * Creates an injectable that is provided at the application root by default (`providedIn: 'root'`).
   *
   * @description
   * Ideal for global services (Singletons) that don't require manual configuration
   * at the component level, while remaining tree-shakable.
   *
   * @param description - A descriptive label for the InjectionToken.
   * @param factory - A factory function. Arguments are optional during auto-instantiation.
   *
   * @example
   * ```typescript
   * export const [injectAuth] = createInjectable.root('Auth', () => {
   *   const user = signal<User | null>(null);
   *   return { user, isLoggedIn: computed(() => Boolean(user())) };
   * });
   *
   * @Component({ ... })
   * export class AppComponent {
   *   protected auth = injectAuth(); // Works without manual provider
   * }
   * ```
   *
   * Alternatively, you can also manually provide it when needed:
   * ```typescript
   * const [injectConfig, provideConfig] = createInjectable.root(
   *   'Config',
   *   (apiUrl = 'https://api.example.com') => ({ apiUrl })
   * );
   *
   * @Component({
   *   providers: [provideConfig('https://api.example.org')],
   * })
   * export class MyComponent {}
   * ```
   */
  root: <Arguments extends any[], Return>(
    description: string,
    factory: (...args: RootArguments<Arguments>) => Return
  ) => CreateInjectableReturn<RootArguments<Arguments>, Return>;
}

export const createInjectable: CreateInjectableFn = (() => {
  const fn = createInjectableFn as CreateInjectableFn;

  fn.root = (description, factory) =>
    createInjectableFn(description, factory as Factory<any[], any>, true) as any;

  return fn;
})();

function createInjectableFn<Arguments extends any[], Return>(
  description: string,
  factory: Factory<Arguments, Return>,
  root = false
): CreateInjectableReturn<Arguments, Return> {
  const injectionToken = new InjectionToken<Return>(
    isDevMode() ? description : '',
    root ? { providedIn: 'root', factory } : undefined
  );

  function provideFn(...args: Arguments): Provider {
    return { provide: injectionToken, useFactory: () => factory(...args) };
  }

  function injectFn(options?: Omit<InjectOptions, 'optional'> & WithInjector): Return;
  function injectFn(options?: InjectOptions & WithInjector): Return | null {
    const { injector, ...injectOptions } = options || {};
    const { runInContext } = setupContext(injector, injectFn);
    return runInContext(() => inject(injectionToken, injectOptions));
  }

  Object.defineProperty(injectFn, 'name', { value: `inject${description}` });

  return [injectFn, provideFn, injectionToken];
}

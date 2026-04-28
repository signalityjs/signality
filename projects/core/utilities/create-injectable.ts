/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { inject, InjectionToken, InjectOptions, isDevMode, Provider } from '@angular/core';
import { setupContext } from '@signality/core/internal';
import type { WithInjector } from '@signality/core/types';

export interface InjectFn<Return> {
  (options?: Omit<InjectOptions, 'optional'> & WithInjector): Return;
  (options?: InjectOptions & WithInjector): Return | null;
}

export type ProvideFn<Params extends any[]> = (...args: Params) => Provider;

export type CreateInjectableRef<Params extends any[], InjectReturn> = Readonly<
  [
    injectFn: InjectFn<InjectReturn>,
    provideFn: ProvideFn<Params>,
    injectionToken: InjectionToken<InjectReturn>
  ]
>;

export type ExtractParams<Factory> = Factory extends (...args: infer Params) => any
  ? Params
  : never;

export type ExtractReturn<Factory> = Factory extends (...args: any[]) => infer Return
  ? Return
  : never;

type HasRequiredParam<Params extends any[]> = Params extends []
  ? false
  : Params extends [infer First, ...infer Rest extends any[]]
  ? undefined extends First
    ? HasRequiredParam<Rest>
    : true
  : false;

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
  <Factory extends Function>(description: string, factory: Factory): CreateInjectableRef<
    ExtractParams<Factory>,
    ExtractReturn<Factory>
  >;

  /**
   * Creates an injectable that is provided at the application root by default (`providedIn: 'root'`).
   *
   * @description
   * Ideal for global services (Singletons) that don't require manual configuration
   * at the component level, while remaining tree-shakable.
   *
   * @param description - A descriptive label for the InjectionToken.
   * @param factory - A factory function. Parameters are optional during auto-instantiation.
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
  root: <Factory extends Function>(
    description: string,
    factory: Factory
  ) => HasRequiredParam<ExtractParams<Factory>> extends true
    ? never
    : CreateInjectableRef<ExtractParams<Factory>, ExtractReturn<Factory>>;
}

export const createInjectable: CreateInjectableFn = (() => {
  const fn = createInjectableFn as CreateInjectableFn;

  fn.root = (description, factory) => createInjectableFn(description, factory, true) as any;

  return fn;
})();

function createInjectableFn<Factory extends Function>(
  description: string,
  factory: Factory,
  root = false
): CreateInjectableRef<ExtractParams<Factory>, ExtractReturn<Factory>> {
  const injectionToken = new InjectionToken<ExtractReturn<Factory>>(
    isDevMode() ? description : '',
    root
      ? { providedIn: 'root', factory: factory as unknown as () => ExtractReturn<Factory> }
      : undefined
  );

  function provideFn(...args: ExtractParams<Factory>): Provider {
    return { provide: injectionToken, useFactory: () => factory(...args) };
  }

  function injectFn(
    options?: Omit<InjectOptions, 'optional'> & WithInjector
  ): ExtractReturn<Factory>;
  function injectFn(options?: InjectOptions & WithInjector): ExtractReturn<Factory> | null {
    const { injector, ...injectOptions } = options || {};
    const { runInContext } = setupContext(injector, injectFn);
    return runInContext(() => inject(injectionToken, injectOptions));
  }

  return [injectFn, provideFn, injectionToken];
}

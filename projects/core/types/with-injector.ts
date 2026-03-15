import type { Injector } from '@angular/core';

/**
 * Provides optional injector property.
 * Use `Required<WithInjector>` when the injector is required.
 */
export interface WithInjector {
  readonly injector?: Injector;
}

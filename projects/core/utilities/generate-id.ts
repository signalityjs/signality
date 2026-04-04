import { inject, InjectionToken } from '@angular/core';
import { setupContext } from '@signality/core/internal';
import type { WithInjector } from '@signality/core/types';

export interface GenerateIdOptions extends WithInjector {
  /**
   * Optional prefix for the generated ID.
   * @default 'app'
   */
  readonly prefix?: string;
}

/**
 * Creates a unique ID string with optional prefix.
 *
 * @param options - Optional configuration with prefix and injector
 * @returns A unique ID string
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     <input [id]="inputId" />
 *   `
 * })
 * export class MyInput {
 *   readonly inputId = generateId();
 * }
 * ```
 */
export function generateId(options?: GenerateIdOptions): string {
  const { runInContext } = setupContext(options?.injector, generateId);

  return runInContext(() => {
    const factoryFn = inject(GENERATE_ID_FACTORY);
    return factoryFn(options?.prefix);
  });
}

export const GENERATE_ID_FACTORY = new InjectionToken<(prefix?: string) => string>(
  typeof ngDevMode !== 'undefined' && ngDevMode ? 'GENERATE_ID_FACTORY' : '',
  {
    providedIn: 'platform',
    factory: () => {
      let i = 0;
      return (prefix = 'app') => `${prefix}-${Date.now()}${i++}`;
    },
  }
);

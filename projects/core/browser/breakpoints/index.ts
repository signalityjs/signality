import { computed, type Signal } from '@angular/core';
import { constSignal, setupContext } from '@signality/core/internal';
import type { WithInjector } from '@signality/core/types';
import { mediaQuery } from '@signality/core/browser/media-query';

export interface BreakpointsOptions<T extends Record<string, string>> extends WithInjector {
  /**
   * Initial values for SSR.
   */
  readonly initialValue?: Partial<Record<keyof T, boolean>>;
}

export type BreakpointsRef<T extends Record<string, string>> = {
  readonly [K in keyof T]: Signal<boolean>;
} & {
  /**
   * List of currently active breakpoint keys — keys whose media query matches at the moment.
   * Updated reactively whenever any breakpoint changes.
   */
  readonly current: Signal<(keyof T)[]>;
};

/**
 * Reactive breakpoint matching using [matchMedia](https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia).
 *
 * @param map - Object mapping breakpoint names to media queries
 * @param options - Optional configuration
 * @returns An object with signals for each breakpoint and a `current` signal with active breakpoint keys
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     @if (bp.mobile()) {
 *       <p>Mobile layout</p>
 *     } @else {
 *       <p>Desktop layout</p>
 *     }
 *     <p>Active: {{ bp.current() }}</p>
 *   `
 * })
 * export class Layout {
 *   readonly bp = breakpoints({
 *     mobile: '(max-width: 767px)',
 *     desktop: '(min-width: 768px)',
 *   });
 * }
 * ```
 */
export function breakpoints<T extends Record<string, string>>(
  map: T,
  options?: BreakpointsOptions<T>
): BreakpointsRef<T> {
  const { runInContext } = setupContext(options?.injector, breakpoints);

  return runInContext(({ isServer }) => {
    const initialValues = (options?.initialValue ?? {}) as Record<keyof T, boolean>;
    const queries: Record<string, Signal<boolean>> = {};

    for (const key of Object.keys(map)) {
      const query = map[key];
      const initialValue = initialValues[key] ?? false;
      queries[key] = mediaQuery(query, { initialValue });
    }

    if (isServer) {
      return {
        ...queries,
        current: constSignal(Object.keys(map).filter(key => initialValues[key])),
      } as BreakpointsRef<T>;
    }

    return {
      ...queries,
      current: computed(() => Object.keys(map).filter(key => queries[key]())),
    } as BreakpointsRef<T>;
  });
}

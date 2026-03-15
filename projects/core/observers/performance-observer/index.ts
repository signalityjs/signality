import {
  afterRenderEffect,
  type CreateEffectOptions,
  type EffectCleanupRegisterFn,
} from '@angular/core';
import { NOOP_EFFECT_REF, setupContext, toValue } from '@signality/core/internal';
import type { MaybeSignal } from '@signality/core/types';

export interface PerformanceObserverInitOptions
  extends Omit<CreateEffectOptions, 'allowSignalWrites'> {
  readonly entryTypes?: MaybeSignal<string[]>;
  readonly type?: MaybeSignal<string>;
  readonly buffered?: MaybeSignal<boolean>;
}

export interface PerformanceObserverRef {
  readonly destroy: () => void;
}

/**
 * Low-level utility for observing performance measurement events using the [Performance Observer API](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceObserver).
 * Provides reactive access to performance entries as they are recorded in the browser's performance timeline.
 *
 * @param callback - Callback function called when performance entries are recorded
 * @param options - Optional configuration (see {@link PerformanceObserverInitOptions})
 * @returns PerformanceObserverRef with a `destroy()` method to stop observing
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     <div>LCP: {{ lcp() }}ms</div>
 *   `
 * })
 * class PerformanceComponent {
 *   readonly lcp = signal(0);
 *
 *   constructor() {
 *     performanceObserver(entries => {
 *       const lcpEntry = entries.find(e => e.entryType === 'largest-contentful-paint');
 *       if (lcpEntry) {
 *         this.lcp.set(Math.round(lcpEntry.startTime));
 *       }
 *     }, { entryTypes: ['largest-contentful-paint'] });
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Track long tasks
 * performanceObserver(entries => {
 *   entries.forEach(entry => {
 *     console.log('Long task:', entry.duration);
 *   });
 * }, { entryTypes: ['longtask'] });
 * ```
 *
 * @example
 * ```typescript
 * // Using type (single entry type, legacy API)
 * performanceObserver(entries => {
 *   console.log('Navigation timing:', entries[0]);
 * }, { type: 'navigation', buffered: true });
 * ```
 */
export function performanceObserver(
  callback: PerformanceObserverCallback,
  options?: PerformanceObserverInitOptions
): PerformanceObserverRef {
  const { runInContext } = setupContext(options?.injector, performanceObserver);

  return runInContext(({ isServer }) => {
    if (isServer) {
      return NOOP_EFFECT_REF;
    }

    const setupObserver = (onCleanup: EffectCleanupRegisterFn) => {
      const entryTypes = toValue(options?.entryTypes);
      const type = toValue(options?.type);
      const buffered = toValue(options?.buffered);

      if (!entryTypes && !type) {
        console.warn(
          '[PerformanceObserver] Either entryTypes or type must be provided. ' +
            'See https://developer.mozilla.org/en-US/docs/Web/API/PerformanceObserver/observe'
        );
        return;
      }

      const observer = new PerformanceObserver(callback);

      observer.observe({
        entryTypes,
        type,
        buffered,
      });

      onCleanup(observer.disconnect.bind(observer));
    };

    const effectRef = afterRenderEffect({ read: setupObserver }, options);

    return { destroy: () => effectRef.destroy() };
  });
}

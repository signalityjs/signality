import { afterRenderEffect, type EffectCleanupRegisterFn, inject, type Signal, signal } from '@angular/core';
import { FocusMonitor, type FocusOrigin } from '@angular/cdk/a11y';
import type { Subscription } from 'rxjs';
import {
  constSignal,
  MaybeElementSignal,
  NOOP_FN,
  onDisconnect,
  setupContext,
  toElement,
  WithInjector,
} from '@signality/core';

export interface FocusMonitorOptions extends WithInjector {
  /**
   * Also monitor focus within children.
   * @default false
   */
  readonly checkChildren?: boolean;
}

export interface FocusMonitorRef {
  /** Whether element is focused */
  readonly isFocused: Signal<boolean>;

  /** Focus origin: 'keyboard', 'mouse', 'touch', 'program', or null */
  readonly origin: Signal<FocusOrigin>;

  /** Focus element with specific origin */
  readonly focusVia: (origin: FocusOrigin, options?: FocusOptions) => void;
}

/**
 * Signal-based wrapper around the [Angular CDK](https://material.angular.io/cdk/a11y/overview) FocusMonitor.
 *
 * @param target - Target element to monitor
 * @param options - Optional configuration
 * @returns A FocusMonitorRef with focus state signals and control methods
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     <button #btn [class.focused]="focus.isFocused()">
 *       Click me
 *       @if (focus.origin(); as origin) {
 *         <span>({{ origin }})</span>
 *       }
 *     </button>
 *     <button (click)="focus.focusVia('program')">Focus programmatically</button>
 *   `
 * })
 * class FocusComponent {
 *   readonly btn = viewChild<ElementRef>('btn');
 *   readonly focus = focusMonitor(this.btn);
 * }
 * ```
 */
export function focusMonitor(
  target: MaybeElementSignal<HTMLElement>,
  options?: FocusMonitorOptions,
): FocusMonitorRef {
  const { runInContext } = setupContext(options?.injector, focusMonitor);

  return runInContext(({ isServer, onCleanup }) => {
    if (isServer) {
      return {
        origin: constSignal(null),
        isFocused: constSignal(false),
        focusVia: NOOP_FN,
      };
    }

    const cdkMonitor = inject(FocusMonitor);

    const origin = signal<FocusOrigin>(null);
    const isFocused = signal(false);

    let subscription: Subscription | undefined;

    const startMonitoring = (el: HTMLElement) => {
      subscription?.unsubscribe();

      subscription = cdkMonitor.monitor(el, options?.checkChildren).subscribe(focusOrigin => {
        origin.set(focusOrigin);
        isFocused.set(focusOrigin !== null);
      });
    };

    const stopMonitoring = (el: HTMLElement) => {
      origin.set(null);
      isFocused.set(false);
      subscription?.unsubscribe();
      cdkMonitor.stopMonitoring(el);
    };

    const focusVia = (origin: FocusOrigin, options?: FocusOptions) => {
      const el = toElement(target);

      if (!el) {
        if (ngDevMode) {
          console.warn('[focusMonitor] Cannot focus: element is not available');
        }
        return;
      }

      cdkMonitor.focusVia(el, origin, options);
    };

    const setupMonitoring = (onCleanup: EffectCleanupRegisterFn) => {
      const el = toElement(target);

      if (el) {
        startMonitoring(el);
        onCleanup(() => stopMonitoring(el));
      }
    };

    onCleanup(() => subscription?.unsubscribe());

    afterRenderEffect({ read: setupMonitoring });

    onDisconnect(target, stopMonitoring);

    return {
      origin: origin.asReadonly(),
      isFocused: isFocused.asReadonly(),
      focusVia,
    };
  });
}

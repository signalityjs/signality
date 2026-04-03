import { afterRenderEffect, computed, inject, type Signal, signal } from '@angular/core';
import { FocusMonitor, type FocusOrigin } from '@angular/cdk/a11y';
import type { Subscription } from 'rxjs';
import { MaybeElementSignal, WithInjector } from '@signality/core';
import { assertElement, constSignal, NOOP_FN, setupContext } from '@signality/core/internal';
import { toElement } from '@signality/core/utilities';

export interface FocusMonitorOptions extends WithInjector {
  /**
   * Whether to also monitor focus changes within child elements of the target.
   *
   * @default false
   * @see [FocusMonitor on Angular CDK](https://material.angular.io/cdk/a11y/overview#focusmonitor)
   */
  readonly checkChildren?: boolean;
}

export interface FocusMonitorRef {
  /**
   * Whether the target element (or any of its children when `checkChildren` is `true`) is focused.
   */
  readonly isFocused: Signal<boolean>;

  /**
   * How the element received focus. One of:
   * - `'mouse'` — focused via mouse click
   * - `'keyboard'` — focused via keyboard navigation
   * - `'touch'` — focused via touch interaction
   * - `'program'` — focused programmatically (e.g. via `focusVia`)
   * - `null` — element is not focused
   *
   * @see [FocusOrigin on Angular CDK](https://material.angular.io/cdk/a11y/api#FocusOrigin)
   */
  readonly origin: Signal<FocusOrigin>;

  /**
   * Programmatically focus the target element with a specific origin.
   * The `origin` will be reflected in the `origin` signal after focusing.
   *
   * @see [FocusMonitor.focusVia() on Angular CDK](https://material.angular.io/cdk/a11y/api#FocusMonitor)
   */
  readonly focusVia: (origin: FocusOrigin, options?: FocusOptions) => void;
}

/**
 * Signal-based wrapper around the [Angular CDK FocusMonitor](https://material.angular.io/cdk/a11y/overview#focusmonitor).
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
  options?: FocusMonitorOptions
): FocusMonitorRef {
  const { runInContext } = setupContext(options?.injector, focusMonitor);

  return runInContext(({ isServer }) => {
    if (isServer) {
      return {
        origin: constSignal(null),
        isFocused: constSignal(false),
        focusVia: NOOP_FN,
      };
    }

    const cdkMonitor = inject(FocusMonitor);

    const origin = signal<FocusOrigin>(null);
    const isFocused = computed(() => origin() !== null);

    let subscription: Subscription | null = null;

    const startMonitoring = (el: HTMLElement) => {
      subscription?.unsubscribe();
      subscription = cdkMonitor.monitor(el, options?.checkChildren).subscribe(origin.set);
    };

    const stopMonitoring = (el: HTMLElement) => {
      origin.set(null);
      subscription?.unsubscribe();
      subscription = null;
      cdkMonitor.stopMonitoring(el);
    };

    const focusVia = (origin: FocusOrigin, options?: FocusOptions) => {
      const el = toElement.untracked(target)!;
      ngDevMode && assertElement(el, 'focusVia');
      cdkMonitor.focusVia(el, origin, options);
    };

    afterRenderEffect({
      read: onCleanup => {
        const el = toElement(target);

        if (el) {
          startMonitoring(el);
          onCleanup(() => stopMonitoring(el));
        }
      },
    });

    return {
      origin: origin.asReadonly(),
      isFocused,
      focusVia,
    };
  });
}

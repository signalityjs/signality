import { type CreateSignalOptions, inject, type Signal, signal } from '@angular/core';
import { type InputModality, InputModalityDetector } from '@angular/cdk/a11y';
import { constSignal, setupContext, WithInjector } from '@signality/core';

export type InputModalityOptions = CreateSignalOptions<InputModality> & WithInjector;

/**
 * Signal-based wrapper around the [Angular CDK](https://material.angular.io/cdk/a11y/overview) InputModalityDetector.
 *
 * @param options - Optional configuration including signal options and injector
 * @returns A signal containing the current input modality: `'keyboard'`, `'mouse'`, `'touch'`, or `null`
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     <div [class.keyboard]="modality() === 'keyboard'">
 *       <p>Current input: {{ modality() ?? 'none' }}</p>
 *       <button>Button with conditional focus ring</button>
 *     </div>
 *   `
 * })
 * class ModalityComponent {
 *   readonly modality = inputModality();
 * }
 * ```
 */
export function inputModality(options?: InputModalityOptions): Signal<InputModality> {
  const { runInContext } = setupContext(options?.injector, inputModality);

  return runInContext(({ isServer, onCleanup }) => {
    if (isServer) {
      return constSignal(null);
    }

    const cdkDetector = inject(InputModalityDetector);

    const current = signal<InputModality>(cdkDetector.mostRecentModality, options);

    const subscription = cdkDetector.modalityChanged.subscribe(modality => {
      current.set(modality);
    });

    onCleanup(subscription.unsubscribe.bind(subscription));

    return current.asReadonly();
  });
}

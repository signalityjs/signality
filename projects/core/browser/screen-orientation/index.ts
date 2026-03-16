import { type CreateSignalOptions, type Signal, signal } from '@angular/core';
import { constSignal, setupContext } from '@signality/core/internal';
import type { WithInjector } from '@signality/core/types';
import { listener, setupSync } from '@signality/core/browser/listener';

export interface ScreenOrientationOptions
  extends CreateSignalOptions<OrientationType>,
    WithInjector {
  /**
   * Initial value for SSR.
   * @default 'portrait-primary'
   */
  readonly initialValue?: OrientationType;
}

/**
 * Reactive wrapper around the [Screen Orientation API](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Orientation_API).
 * Returns a signal that tracks the current screen orientation.
 *
 * @param options - Optional configuration including signal options and injector
 * @returns A signal containing the current orientation type (`'portrait-primary'`, `'portrait-secondary'`, `'landscape-primary'`, or `'landscape-secondary'`)
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     <p>Orientation: {{ orientation() }}</p>
 *   `
 * })
 * class OrientationDemo {
 *   readonly orientation = screenOrientation();
 * }
 * ```
 */
export function screenOrientation(options?: ScreenOrientationOptions): Signal<OrientationType> {
  const { runInContext } = setupContext(options?.injector, screenOrientation);

  return runInContext(({ isServer }) => {
    if (isServer) {
      return constSignal(options?.initialValue || 'portrait-primary');
    }

    const orientation = signal(screen.orientation.type, options);

    setupSync(() => {
      listener(screen.orientation, 'change', () => orientation.set(screen.orientation.type));
    });

    return orientation.asReadonly();
  });
}

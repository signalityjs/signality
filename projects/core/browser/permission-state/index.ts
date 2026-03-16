import { type CreateSignalOptions, type Signal, signal } from '@angular/core';
import { constSignal, setupContext } from '@signality/core/internal';
import type { WithInjector } from '@signality/core/types';

export type PermissionStateOptions = CreateSignalOptions<PermissionState> & WithInjector;

/**
 * Signal-based wrapper around the [Permissions API](https://developer.mozilla.org/en-US/docs/Web/API/Permissions_API).
 *
 * @param name - The permission name to query
 * @param options - Optional configuration including signal options and injector
 * @returns A signal containing the current `PermissionState` (`'granted'`, `'denied'`, or `'prompt'`)
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     <p>Camera permission: {{ cameraPermission() }}</p>
 *   `
 * })
 * class PermissionDemo {
 *   readonly cameraPermission = permissionState('camera');
 * }
 * ```
 */
export function permissionState(
  name: PermissionName,
  options?: PermissionStateOptions
): Signal<PermissionState> {
  const { runInContext } = setupContext(options?.injector, permissionState);

  return runInContext(({ isServer, onCleanup }) => {
    if (isServer) {
      return constSignal('prompt');
    }

    const state = signal<PermissionState>('prompt', options);
    const controller = new AbortController();

    navigator.permissions
      .query({ name })
      .then(status => {
        if (controller.signal.aborted) {
          return;
        }

        state.set(status.state);

        status.addEventListener('change', () => state.set(status.state), {
          signal: controller.signal,
        });
      })
      .catch(() => {
        if (ngDevMode) {
          console.warn(`[permissionState] Failed to query permission state for ${name}`);
        }
      });

    onCleanup(() => controller.abort());

    return state.asReadonly();
  });
}

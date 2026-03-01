import { effect, type Signal, signal } from '@angular/core';
import { constSignal, setupContext } from '@signality/core/internal';
import type { WithInjector } from '@signality/core/types';
import { listener } from '@signality/core/browser/listener';

export interface ScreenDetailsInfo {
  readonly id: string;
  readonly label: string;
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
  readonly colorDepth: number;
  readonly pixelDepth: number;
  readonly isPrimary: boolean;
  readonly isInternal: boolean;
  readonly pointerTypes: readonly string[];
}

export interface ScreenDetailsRef {
  /** Whether Window Management API is supported */
  readonly isSupported: Signal<boolean>;

  /** Current screens list */
  readonly screens: Signal<readonly ScreenDetailsInfo[]>;

  /** Current screen (primary) */
  readonly currentScreen: Signal<ScreenDetailsInfo | undefined>;
}

/**
 * Reactive wrapper around the [Window Management API](https://developer.mozilla.org/en-US/docs/Web/API/Window_Management_API).
 * Track multiple screens and their properties with Angular signals.
 *
 * @param options - Optional configuration including injector
 * @returns A ScreenDetailsRef with screens list and current screen signals
 *
 * @example
 * ```typescript
 * const screens = screenDetails();
 *
 * if (screens.isSupported()) {
 *   effect(() => {
 *     console.log('Screens:', screens.screens());
 *     console.log('Current:', screens.currentScreen());
 *   });
 * }
 * ```
 */
export function screenDetails(options?: WithInjector): ScreenDetailsRef {
  const { runInContext } = setupContext(options?.injector, screenDetails);

  return runInContext(({ isBrowser }) => {
    const isSupported = signal(
      isBrowser &&
        'getScreenDetails' in window &&
        typeof (window as any).getScreenDetails === 'function'
    );

    if (!isSupported()) {
      return {
        isSupported,
        screens: constSignal([]),
        currentScreen: constSignal(undefined),
      };
    }

    const screens = signal<readonly ScreenDetailsInfo[]>([]);
    const currentScreen = signal<ScreenDetailsInfo | undefined>(undefined);

    const mapScreen = (screen: Screen): ScreenDetailsInfo => ({
      id: screen.id || '',
      label: screen.label || 'Unknown',
      left: screen.left,
      top: screen.top,
      width: screen.width,
      height: screen.height,
      colorDepth: screen.colorDepth,
      pixelDepth: screen.pixelDepth,
      isPrimary: screen.isPrimary ?? false,
      isInternal: screen.isInternal ?? false,
      pointerTypes: screen.pointerTypes || [],
    });

    effect(async () => {
      try {
        const screenDetailsObj = (await (window as any).getScreenDetails()) as ScreenDetails;

        const update = () => {
          const screensList = screenDetailsObj.screens.map(mapScreen);
          screens.set(screensList);
          currentScreen.set(mapScreen(screenDetailsObj.currentScreen));
        };

        update();

        listener(screenDetailsObj, 'screenschange', update);
      } catch (error) {
        isSupported.set(false);
        if (ngDevMode) {
          console.warn(
            `[screenDetails] Failed to get screen details. ` +
              `This may be due to permission denied or API not available.`,
            error
          );
        }
      }
    });

    return {
      isSupported: isSupported.asReadonly(),
      screens: screens.asReadonly(),
      currentScreen: currentScreen.asReadonly(),
    };
  });
}

interface ScreenDetails extends EventTarget {
  readonly screens: readonly Screen[];
  readonly currentScreen: Screen;
}

interface Screen {
  readonly availLeft: number;
  readonly availTop: number;
  readonly availWidth: number;
  readonly availHeight: number;
  readonly colorDepth: number;
  readonly pixelDepth: number;
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
  readonly orientation?: ScreenOrientation;
  readonly isExtended?: boolean;
  readonly isPrimary?: boolean;
  readonly isInternal?: boolean;
  readonly label?: string;
  readonly id?: string;
  readonly pointerTypes?: readonly string[];
}

import { type Signal, signal } from '@angular/core';
import { constSignal, NOOP_ASYNC_FN, NOOP_FN, setupContext } from '@signality/core/internal';
import type { WithInjector } from '@signality/core/types';

export interface EyeDropperOptions extends WithInjector {
  /**
   * Initial color value in sRGB hex format.
   * @default ''
   */
  readonly initialValue?: string;
}

export interface EyeDropperRef {
  /** Current selected color in sRGB hex format */
  readonly sRGBHex: Signal<string>;

  /** Whether EyeDropper API is supported */
  readonly isSupported: Signal<boolean>;

  /** Open the eyedropper tool to select a color */
  readonly open: () => Promise<void>;

  /** Cancel the active eyedropper operation */
  readonly close: () => void;
}

/**
 * Signal-based wrapper around the [EyeDropper API](https://developer.mozilla.org/en-US/docs/Web/API/EyeDropper_API).
 *
 * @param options - Optional configuration
 * @returns An {@link EyeDropperRef} with `isSupported`, `sRGBHex` signals and `open`/`close` methods
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     @if (eyeDropper.isSupported()) {
 *       <button (click)="pickColor()">Pick Color</button>
 *       <div [style.background-color]="eyeDropper.sRGBHex()">
 *         Selected: {{ eyeDropper.sRGBHex() }}
 *       </div>
 *     }
 *   `
 * })
 * class ColorPickerComponent {
 *   readonly eyeDropper = eyeDropper();
 *
 *   async pickColor() {
 *     await this.eyeDropper.open();
 *   }
 * }
 * ```
 */
export function eyeDropper(options?: EyeDropperOptions): EyeDropperRef {
  const { runInContext } = setupContext(options?.injector, eyeDropper);

  return runInContext(({ isBrowser, onCleanup }) => {
    const isSupported = constSignal(isBrowser && 'EyeDropper' in window);

    if (!isSupported()) {
      return {
        isSupported,
        sRGBHex: constSignal(''),
        open: NOOP_ASYNC_FN,
        close: NOOP_FN,
      };
    }

    const sRGBHex = signal(options?.initialValue ?? '');

    let abortController: AbortController | null = null;

    const open = async (): Promise<void> => {
      close();

      abortController = new AbortController();
      const eyeDropper: EyeDropper = new (window as any).EyeDropper();

      try {
        const result = await eyeDropper.open({ signal: abortController.signal });
        sRGBHex.set(result.sRGBHex);
      } catch (error) {
        if (ngDevMode) {
          console.warn(
            `[eyeDropper] Failed to open eyedropper. ` +
              `This may be due to user cancellation or an error occurred.`,
            error
          );
        }
      } finally {
        abortController = null;
      }
    };

    const close = () => {
      abortController?.abort();
      abortController = null;
    };

    onCleanup(close);

    return {
      isSupported,
      sRGBHex: sRGBHex.asReadonly(),
      open,
      close,
    };
  });
}

interface EyeDropper {
  // eslint-disable-next-line @typescript-eslint/no-misused-new
  new (): EyeDropper;
  readonly open: (options?: EyeDropperOpenOptions) => Promise<{ sRGBHex: string }>;
  [Symbol.toStringTag]: 'EyeDropper';
}

interface EyeDropperOpenOptions {
  /**
   * AbortSignal to cancel the eyedropper operation.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal
   */
  readonly signal?: AbortSignal;
}

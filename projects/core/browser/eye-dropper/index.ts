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
  /**
   * Whether the EyeDropper API is supported in the current browser.
   *
   * @see [EyeDropper browser compatibility on MDN](https://developer.mozilla.org/en-US/docs/Web/API/EyeDropper#browser_compatibility)
   */
  readonly isSupported: Signal<boolean>;

  /**
   * The most recently selected color in sRGB hex format (e.g. `#ff0000`).
   *
   * @see [EyeDropper: open() return value on MDN](https://developer.mozilla.org/en-US/docs/Web/API/EyeDropper/open#return_value)
   */
  readonly sRGBHex: Signal<string>;

  /**
   * Open the eyedropper tool and wait for the user to select a color.
   *
   * @see [EyeDropper: open() on MDN](https://developer.mozilla.org/en-US/docs/Web/API/EyeDropper/open)
   */
  readonly open: () => Promise<void>;

  /**
   * Cancel the active eyedropper operation via `AbortController`.
   *
   * @see [AbortController: abort() on MDN](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort)
   */
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
 * export class ColorPicker {
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
        if ((error as Error).name !== 'AbortError') {
          throw error;
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
   *
   * @see [AbortSignal on MDN](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal)
   */
  readonly signal?: AbortSignal;
}

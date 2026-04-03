import { type Signal, signal } from '@angular/core';
import { constSignal, NOOP_ASYNC_FN, setupContext, type Timer } from '@signality/core/internal';
import { toValue } from '@signality/core/utilities';
import type { MaybeSignal, WithInjector } from '@signality/core/types';

export interface ClipboardOptions extends WithInjector {
  /**
   * How long `copied` stays `true` after copy (ms).
   * @default 1500
   */
  readonly copiedDuration?: MaybeSignal<number>;
}

export interface ClipboardRef {
  /**
   * Whether the Clipboard API is supported in the current browser.
   *
   * @see [Clipboard API browser compatibility on MDN](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API#browser_compatibility)
   */
  readonly isSupported: Signal<boolean>;

  /**
   * The most recently copied or pasted text.
   */
  readonly text: Signal<string>;

  /**
   * Whether the text was recently copied. Resets to `false` after `copiedDuration` ms.
   */
  readonly copied: Signal<boolean>;

  /**
   * Write text to the clipboard.
   *
   * @see [Clipboard: writeText() on MDN](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText)
   */
  readonly copy: (text: string) => Promise<void>;

  /**
   * Read text from the clipboard.
   *
   * @see [Clipboard: readText() on MDN](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/readText)
   */
  readonly paste: () => Promise<string>;
}

/**
 * Signal-based wrapper around the [Clipboard API](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API).
 *
 * @param options - Optional configuration
 * @returns A ClipboardRef with text, copied, isSupported signals and copy/paste methods
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     <input #input value="Hello World!" />
 *     <button (click)="copyText(input.value)">Copy</button>
 *     @if (cb.copied()) {
 *       <span>Copied!</span>
 *     }
 *   `
 * })
 * export class ClipboardDemo {
 *   readonly cb = clipboard();
 *
 *   async copyText(text: string) {
 *     await this.cb.copy(text);
 *   }
 * }
 * ```
 */
export function clipboard(options?: ClipboardOptions): ClipboardRef {
  const { runInContext } = setupContext(options?.injector, clipboard);

  return runInContext(({ isBrowser, onCleanup }) => {
    const isSupported = constSignal(
      isBrowser && 'clipboard' in navigator && typeof navigator.clipboard?.writeText === 'function'
    );

    if (!isSupported()) {
      return {
        isSupported,
        text: constSignal(''),
        copied: constSignal(false),
        copy: NOOP_ASYNC_FN,
        paste: () => Promise.resolve(''),
      };
    }

    const copiedDuration = options?.copiedDuration ?? 1500;

    const text = signal('');
    const copied = signal(false);

    let copiedTimeout: Timer;

    const copy = async (value: string): Promise<void> => {
      try {
        await navigator.clipboard.writeText(value);

        text.set(value);
        copied.set(true);

        if (copiedTimeout) {
          clearTimeout(copiedTimeout);
        }

        copiedTimeout = setTimeout(() => {
          copied.set(false);
          copiedTimeout = undefined;
        }, toValue.untracked(copiedDuration));
      } catch (error) {
        copied.set(false);
        if (ngDevMode) {
          console.warn(
            `[clipboard] Failed to copy text to clipboard. ` +
              `This may be due to permission denied or clipboard access failed.`,
            error
          );
        }
      }
    };

    const paste = async (): Promise<string> => {
      try {
        const value = await navigator.clipboard.readText();
        text.set(value);
        return value;
      } catch (error) {
        if (ngDevMode) {
          console.warn(
            `[clipboard] Failed to read text from clipboard. ` +
              `This may be due to permission denied or clipboard access failed.`,
            error
          );
        }
        return '';
      }
    };

    onCleanup(() => {
      if (copiedTimeout) {
        clearTimeout(copiedTimeout);
      }
    });

    return {
      isSupported,
      text: text.asReadonly(),
      copied: copied.asReadonly(),
      copy,
      paste,
    };
  });
}

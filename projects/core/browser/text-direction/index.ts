import { afterNextRender, CreateSignalOptions, signal, WritableSignal } from '@angular/core';
import { createToken, setupContext } from '@signality/core/internal';
import { toElement } from '@signality/core/utilities';
import type { MaybeElementSignal, WithInjector } from '@signality/core/types';
import { mutationObserver } from '@signality/core/observers/mutation-observer';
import { proxySignal } from '@signality/core/reactivity/proxy-signal';

/**
 * Possible text direction values matching the HTML `dir` attribute.
 */
export type TextDirection = 'ltr' | 'rtl' | 'auto';

export interface TextDirectionOptions extends CreateSignalOptions<TextDirection>, WithInjector {
  /**
   * Element to observe. Defaults to `document.documentElement` (`<html>`).
   */
  readonly target?: MaybeElementSignal<HTMLElement>;

  /**
   * Initial value for SSR.
   * @default 'ltr'
   */
  readonly initialValue?: TextDirection;
}

/**
 * Reactive read/write wrapper around an element's `dir` attribute for detecting and controlling
 * [text directionality](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/dir).
 *
 * @param options - Optional configuration including target element, initial value and injector
 * @returns A writable signal of the current text direction
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     <p>Current direction: {{ dir() }}</p>
 *     <button (click)="dir.set('rtl')">Set RTL</button>
 *     <button (click)="dir.set('ltr')">Set LTR</button>
 *   `
 * })
 * export class TextDirectionDemo {
 *   readonly dir = textDirection();
 * }
 * ```
 */
export function textDirection(options?: TextDirectionOptions): WritableSignal<TextDirection> {
  const { runInContext } = setupContext(options?.injector, textDirection);

  return runInContext(({ isServer }) => {
    const initialValue = options?.initialValue ?? 'ltr';

    if (isServer) {
      return signal(initialValue, options);
    }

    const target = options?.target ?? document.documentElement;

    const getDir = (): TextDirection => {
      const el = toElement(target);
      return (el?.getAttribute('dir') as TextDirection) || initialValue;
    };

    const setDir = (value: TextDirection) => {
      const el = toElement(target);
      el?.setAttribute('dir', value);
    };

    const dir = signal<TextDirection>(getDir(), options);

    mutationObserver(target, () => dir.set(getDir()), {
      attributes: true,
      attributeFilter: ['dir'],
    });

    afterNextRender({
      earlyRead: () => dir.set(getDir()),
      write: () => setDir(dir()),
    });

    return proxySignal(
      dir,
      {
        set: value => {
          setDir(value);
          dir.set(value);
        },
      },
      { equal: options?.equal }
    );
  });
}

export const TEXT_DIRECTION = /* @__PURE__ */ createToken(textDirection);

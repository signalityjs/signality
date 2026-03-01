import {
  afterRenderEffect,
  type CreateEffectOptions,
  type EffectCleanupRegisterFn,
} from '@angular/core';
import { NOOP_EFFECT_REF, setupContext, toElement, toValue } from '@signality/core/internal';
import type { MaybeElementSignal, MaybeSignal } from '@signality/core/types';

export interface MutationObserverInitOptions
  extends Omit<CreateEffectOptions, 'allowSignalWrites'> {
  readonly childList?: MaybeSignal<boolean>;
  readonly attributes?: MaybeSignal<boolean>;
  readonly characterData?: MaybeSignal<boolean>;
  readonly subtree?: MaybeSignal<boolean>;
  readonly attributeOldValue?: MaybeSignal<boolean>;
  readonly characterDataOldValue?: MaybeSignal<boolean>;
  readonly attributeFilter?: MaybeSignal<string[]>;
}

export interface MutationObserverRef {
  readonly destroy: () => void;
}

/**
 * Low-level utility for observing DOM tree changes using the [MutationObserver API](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver).
 * Provides fine-grained control over the observation lifecycle.
 *
 * @param target - Element(s) to observe
 * @param callback - Callback function called when DOM mutations occur
 * @param options - Optional configuration (see {@link MutationObserverInitOptions})
 * @returns MutationObserverRef with a `destroy()` method to stop observing the element(s)
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     <div #container>
 *       <p>Children: {{ childCount() }}</p>
 *     </div>
 *   `
 * })
 * class MutationComponent {
 *   readonly container = viewChild<ElementRef>('container');
 *   readonly childCount = signal(0);
 *
 *   constructor() {
 *     mutationObserver(this.container, mutations => {
 *       this.childCount.set(mutations[0].target.childNodes.length);
 *     }, { childList: true });
 *   }
 * }
 * ```
 */
export function mutationObserver(
  target: MaybeElementSignal<Element> | MaybeElementSignal<Element>[],
  callback: (mutations: readonly MutationRecord[], observer: MutationObserver) => void,
  options: MutationObserverInitOptions
): MutationObserverRef {
  const { runInContext } = setupContext(options.injector, mutationObserver);

  return runInContext(({ isServer }) => {
    if (isServer) {
      return NOOP_EFFECT_REF;
    }

    const targets = Array.isArray(target) ? target : [target];

    const setupObserver = (onCleanup: EffectCleanupRegisterFn) => {
      const els = targets.map(toElement).filter(Boolean);

      if (!els.length) {
        return;
      }

      const childList = toValue(options.childList);
      const attributes = toValue(options.attributes);
      const characterData = toValue(options.characterData);
      const subtree = toValue(options.subtree);
      const attributeOldValue = toValue(options.attributeOldValue);
      const characterDataOldValue = toValue(options.characterDataOldValue);
      const attributeFilter = toValue(options.attributeFilter);

      const observer = new MutationObserver(callback);

      for (const el of els) {
        observer.observe(el!, {
          childList,
          attributes,
          characterData,
          subtree,
          attributeOldValue,
          characterDataOldValue,
          attributeFilter,
        });
      }

      onCleanup(observer.disconnect.bind(observer));
    };

    const effectRef = afterRenderEffect({ read: setupObserver }, options);

    return { destroy: () => effectRef.destroy() };
  });
}

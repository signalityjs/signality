import {
  afterRenderEffect,
  type CreateEffectOptions,
  type EffectCleanupRegisterFn,
} from '@angular/core';
import {
  assertElement,
  NOOP_EFFECT_REF,
  setupContext,
  toElement,
  toValue,
} from '@signality/core/internal';
import type { MaybeElementSignal, MaybeSignal } from '@signality/core/types';

export interface MutationObserverInitOptions
  extends Omit<CreateEffectOptions, 'allowSignalWrites'> {
  /**
   * Whether to observe additions and removals of child nodes.
   *
   * @see [MutationObserver.observe(): childList on MDN](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver/observe#childlist)
   */
  readonly childList?: MaybeSignal<boolean>;

  /**
   * Whether to observe attribute changes on the target element.
   * Use `attributeFilter` to limit which attributes are observed.
   *
   * @see [MutationObserver.observe(): attributes on MDN](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver/observe#attributes)
   */
  readonly attributes?: MaybeSignal<boolean>;

  /**
   * Whether to observe changes to the text content (`CharacterData`) of the target.
   *
   * @see [MutationObserver.observe(): characterData on MDN](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver/observe#characterdata)
   */
  readonly characterData?: MaybeSignal<boolean>;

  /**
   * Whether to extend observation to the entire subtree of the target element.
   *
   * @see [MutationObserver.observe(): subtree on MDN](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver/observe#subtree)
   */
  readonly subtree?: MaybeSignal<boolean>;

  /**
   * Whether to record the previous attribute value in each `MutationRecord`.
   * Implicitly sets `attributes` to `true` if not already set.
   *
   * @see [MutationObserver.observe(): attributeOldValue on MDN](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver/observe#attributeoldvalue)
   */
  readonly attributeOldValue?: MaybeSignal<boolean>;

  /**
   * Whether to record the previous character data value in each `MutationRecord`.
   * Implicitly sets `characterData` to `true` if not already set.
   *
   * @see [MutationObserver.observe(): characterDataOldValue on MDN](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver/observe#characterdataoldvalue)
   */
  readonly characterDataOldValue?: MaybeSignal<boolean>;

  /**
   * Array of attribute local names to observe. Only mutations to listed attributes are reported.
   * Implicitly sets `attributes` to `true` if not already set.
   *
   * @see [MutationObserver.observe(): attributeFilter on MDN](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver/observe#attributefilter)
   */
  readonly attributeFilter?: MaybeSignal<string[]>;
}

export interface MutationObserverRef {
  /**
   * Stop observing all targets and disconnect the underlying `MutationObserver`.
   */
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
        ngDevMode && assertElement(el, 'mutationObserver');

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

import { computed, type Signal, signal } from '@angular/core';
import {
  ALWAYS_FALSE_FN,
  constSignal,
  createToken,
  isNodeWithin,
  NOOP_FN,
  setupContext,
} from '@signality/core/internal';
import type { MaybeElementSignal, WithInjector } from '@signality/core/types';
import { toElement } from '@signality/core/utilities';
import { listener, setupSync } from '@signality/core/browser/listener';
import { onDisconnect } from '@signality/core/elements/on-disconnect';

export interface TextSelectionOptions extends WithInjector {
  /**
   * Element to track selection within.
   * When provided, only selections entirely contained within this element are tracked.
   * @default document (all selections)
   */
  readonly root?: MaybeElementSignal<Element>;
}

export interface TextSelectionRef {
  /** The selected text content */
  readonly text: Signal<string>;

  /** Array of Range objects */
  readonly ranges: Signal<Range[]>;

  /** Bounding rectangles of selection */
  readonly rects: Signal<DOMRect[]>;

  /** The raw Selection object */
  readonly selection: Signal<Selection | null>;

  /** Clear the current text selection */
  readonly clear: () => void;
}

/**
 * Signal-based wrapper around the [Selection API](https://developer.mozilla.org/en-US/docs/Web/API/Selection_API).
 *
 * @param options - Optional configuration including injector
 * @returns A TextSelectionRef with reactive signals for text, ranges, rects, and selection
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     <p>Select some text below:</p>
 *     <div>Lorem ipsum dolor sit amet...</div>
 *     @if (selection.text(); as text) {
 *       <p>Selected: "{{ text }}"</p>
 *     }
 *   `
 * })
 * export class TextSelectionDemo {
 *   readonly selection = textSelection();
 * }
 * ```
 */
export function textSelection(options?: TextSelectionOptions): TextSelectionRef {
  const { runInContext } = setupContext(options?.injector, textSelection);

  return runInContext(({ isServer }) => {
    if (isServer) {
      return {
        selection: constSignal(null),
        text: constSignal(''),
        ranges: constSignal([]),
        rects: constSignal([]),
        clear: NOOP_FN,
      };
    }

    const root = options?.root;

    const getSelection = (): Selection | null => {
      const sel = window.getSelection();
      if (!root || !sel) {
        return sel;
      }

      const rootEl = toElement(root);
      if (rootEl && isSelectionWithinRoot(sel, rootEl)) {
        return sel;
      } else {
        return null;
      }
    };

    const selection = signal<Selection | null>(getSelection(), {
      equal: ALWAYS_FALSE_FN,
    });

    const text = computed(() => selection()?.toString() ?? '');

    const ranges = computed<Range[]>(() => {
      const sel = selection();
      return sel ? getRangesFromSelection(sel) : [];
    });

    const rects = computed(() => ranges().map(range => range.getBoundingClientRect()));

    const clear = () => {
      window.getSelection()?.removeAllRanges();
    };

    setupSync(() => {
      listener(document, 'selectionchange', () => {
        selection.set(getSelection());
      });
    });

    if (root) {
      onDisconnect(root, () => selection.set(null));
    }

    return {
      selection: selection.asReadonly(),
      text,
      ranges,
      rects,
      clear,
    };
  });
}

export const TEXT_SELECTION = /* @__PURE__ */ createToken(textSelection);

function getRangesFromSelection(selection: Selection): Range[] {
  const rangeCount = selection.rangeCount ?? 0;
  return Array.from({ length: rangeCount }, (_, i) => selection.getRangeAt(i));
}

function isSelectionWithinRoot(selection: Selection, rootEl: Element): boolean {
  if (selection.rangeCount === 0) {
    return false;
  }
  const { startContainer, endContainer } = selection.getRangeAt(0);
  return isNodeWithin(startContainer, rootEl) && isNodeWithin(endContainer, rootEl);
}

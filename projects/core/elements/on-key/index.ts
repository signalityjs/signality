import { isSignal, type Signal } from '@angular/core';
import { isDocument, isWindow, NOOP_EFFECT_REF, setupContext } from '@signality/core/internal';
import { toValue } from '@signality/core/utilities';
import type { MaybeElementSignal, MaybeSignal, WithInjector } from '@signality/core/types';
import { listener, type ListenerRef, setupSync } from '@signality/core/browser/listener';
import { watcher } from '@signality/core/reactivity/watcher';

/**
 * Custom predicate deciding whether a keyboard event should invoke the handler.
 */
export type KeyPredicate = (event: KeyboardEvent) => boolean;

/**
 * Filter deciding which keyboard events invoke the handler:
 * - `string` — matched against `event.key`, modifier flags ignored
 * - `string[]` — a key combination: modifier keys (`'Meta'`, `'Control'`, `'Alt'`, `'Shift'`)
 *   plus at most one regular key, matched exactly against the event's modifier flags
 * - `Signal<string | string[]>` — reactive filter; the listener is re-bound on every change
 * - `KeyPredicate` — custom matching logic
 */
export type KeyFilter = MaybeSignal<string | string[]> | KeyPredicate;

export interface OnKeyOptions extends WithInjector {
  /**
   * Event target to listen on.
   * @default window
   */
  readonly target?: MaybeElementSignal<HTMLElement> | Window | Document;

  /**
   * Keyboard event to listen for.
   * @default 'keydown'
   */
  readonly eventName?: 'keydown' | 'keyup';

  /**
   * Register the listener as passive.
   * @default false
   */
  readonly passive?: boolean;

  /**
   * Ignore repeated events while the key is being held down (`event.repeat`).
   * @default false
   */
  readonly dedupe?: MaybeSignal<boolean>;
}

export interface OnKeyRef {
  /** Stops listening for keyboard events. */
  readonly destroy: () => void;
}

/**
 * Listen for keyboard events matching a key filter.
 *
 * String filters match `event.key` exactly. Array filters describe a key combination
 * (e.g. `['Meta', 'K']`) matched exactly against the event's modifier flags — extra
 * modifiers prevent a match. Use a {@link KeyPredicate} for custom or "any of" matching.
 *
 * @remarks
 * Single-character keys match case-insensitively — `'k'`, `['Meta', 'k']`, and
 * `['Meta', 'K']` all keep working with CapsLock on. Multi-character key names such as
 * `'Enter'` are exact and follow the canonical `event.key` values; common aliases are
 * resolved automatically — `'Ctrl'` → `'Control'`, `'Cmd'`/`'Command'`/`'Win'` → `'Meta'`,
 * `'Option'`/`'Opt'` → `'Alt'`, `'Esc'` → `'Escape'`, `'Del'` → `'Delete'`,
 * `'Return'` → `'Enter'`, `'Space'` → `' '`. Use a {@link KeyPredicate} for strict
 * case matching.
 *
 * @param key - Key filter: `event.key` string, key combination array, signal of either, or predicate
 * @param handler - Callback invoked with the matching keyboard event
 * @param options - Optional configuration including target, event name, passive, dedupe, and injector
 * @returns An OnKeyRef with a destroy method to stop listening
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `<p>Press ⌘K</p>`,
 * })
 * export class HotkeyDemo {
 *   constructor() {
 *     onKey(['Meta', 'K'], event => {
 *       event.preventDefault();
 *       console.log('Command palette!');
 *     });
 *   }
 * }
 * ```
 *
 * @see [KeyboardEvent.key](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key)
 */
export function onKey(
  key: KeyFilter,
  handler: (event: KeyboardEvent) => void,
  options?: OnKeyOptions
): OnKeyRef;

/**
 * Listen for every keyboard event on the target.
 *
 * @param handler - Callback invoked with each keyboard event
 * @param options - Optional configuration including target, event name, passive, dedupe, and injector
 * @returns An OnKeyRef with a destroy method to stop listening
 */
export function onKey(handler: (event: KeyboardEvent) => void, options?: OnKeyOptions): OnKeyRef;

export function onKey(...args: unknown[]): OnKeyRef {
  let key: KeyFilter | undefined;
  let rawHandler: (event: KeyboardEvent) => void;
  let options: OnKeyOptions | undefined;

  if (typeof args[1] === 'function') {
    [key, rawHandler, options] = args as [KeyFilter, typeof rawHandler, OnKeyOptions?];
  } else {
    [rawHandler, options] = args as [typeof rawHandler, OnKeyOptions?];
  }

  const { runInContext } = setupContext(options?.injector, onKey);

  return runInContext(({ isServer, injector }) => {
    if (isServer) {
      return NOOP_EFFECT_REF;
    }

    const target = options?.target ?? window;
    const eventName = options?.eventName ?? 'keydown';
    const dedupe = options?.dedupe ?? false;
    const listenerFn = options?.passive ? listener.passive : listener;
    const isGlobalTarget = isWindow(target) || isDocument(target);

    const bind = (predicate: KeyPredicate): ListenerRef => {
      const handler = (e: KeyboardEvent) => {
        if (e.repeat && toValue(dedupe)) {
          return;
        }

        if (predicate(e)) {
          rawHandler(e);
        }
      };

      const setupListener = () => listenerFn(target, eventName, handler, { injector });
      return isGlobalTarget ? setupSync(setupListener) : setupListener();
    };

    if (!isSignal(key)) {
      const keyListener = bind(createKeyPredicate(key));
      return { destroy: () => keyListener.destroy() };
    }

    const reactiveKey = key as Signal<string | string[]>;

    let keyListener = bind(createKeyPredicate(toValue(reactiveKey)));

    const keyWatcher = watcher(reactiveKey, key => {
      keyListener.destroy();
      keyListener = bind(createKeyPredicate(key));
    });

    return {
      destroy: () => {
        keyWatcher.destroy();
        keyListener.destroy();
      },
    };
  });
}

const MODIFIER_FLAGS = {
  Alt: 'altKey',
  Control: 'ctrlKey',
  Meta: 'metaKey',
  Shift: 'shiftKey',
} as const;

type ModifierKey = keyof typeof MODIFIER_FLAGS;

const MODIFIER_KEYS = Object.keys(MODIFIER_FLAGS) as readonly ModifierKey[];

interface KeyCombination {
  readonly modifiers: ReadonlySet<ModifierKey>;
  readonly regularKey: string | undefined;
}

function isModifierKey(key: string): key is ModifierKey {
  return key in MODIFIER_FLAGS;
}

const KEY_ALIASES: Record<string, string> = {
  ctrl: 'Control',
  cmd: 'Meta',
  command: 'Meta',
  win: 'Meta',
  option: 'Alt',
  opt: 'Alt',
  esc: 'Escape',
  del: 'Delete',
  return: 'Enter',
  space: ' ',
};

function resolveKey(key: string): string {
  return KEY_ALIASES[key.toLowerCase()] ?? key;
}

// Single characters match case-insensitively so CapsLock cannot change the outcome;
// multi-character key names ('Enter', 'ArrowDown') are canonical and stay exact.
function normalizeKey(key: string): string {
  return key.length === 1 ? key.toLowerCase() : key;
}

function matchesKey(normalizedKey: string, event: KeyboardEvent): boolean {
  return normalizedKey.length === 1
    ? event.key.toLowerCase() === normalizedKey
    : event.key === normalizedKey;
}

function parseCombination(keys: readonly string[]): KeyCombination | null {
  const modifiers = new Set<ModifierKey>();

  let regularKey: string | undefined;

  for (const rawKey of keys) {
    const key = resolveKey(rawKey);

    if (isModifierKey(key)) {
      modifiers.add(key);
    } else if (regularKey === undefined) {
      regularKey = normalizeKey(key);
    } else {
      if (ngDevMode) {
        throw new Error(
          `[onKey] Array filters describe a single key combination and may contain at most ` +
            `one non-modifier key, but received: [${keys.join(', ')}]. ` +
            `For "any of" matching use a predicate: event => ['a', 'b'].includes(event.key).`
        );
      }
      return null;
    }
  }

  return { modifiers, regularKey };
}

function matchesCombination(combination: KeyCombination | null, event: KeyboardEvent): boolean {
  if (!combination) {
    return false;
  }

  const { modifiers, regularKey } = combination;

  for (const modifier of MODIFIER_KEYS) {
    if (event[MODIFIER_FLAGS[modifier]] !== modifiers.has(modifier)) {
      return false;
    }
  }

  if (regularKey !== undefined) {
    return matchesKey(regularKey, event);
  }

  // Modifier-only combination: fire on the keydown of the declared modifier
  // that completes the combination.
  return isModifierKey(event.key) && modifiers.has(event.key);
}

function createKeyPredicate(key: string | string[] | KeyPredicate | undefined): KeyPredicate {
  if (key === undefined) {
    return () => true;
  }

  if (typeof key === 'function') {
    return key;
  }

  if (Array.isArray(key)) {
    const combination = parseCombination(key);
    return event => matchesCombination(combination, event);
  }

  const normalizedKey = normalizeKey(resolveKey(key));
  return event => matchesKey(normalizedKey, event);
}

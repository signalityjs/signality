---
source: https://github.com/signalityjs/signality/blob/main/projects/core/elements/on-key/index.ts
---

# OnKey

Listen for keyboard events matching a key filter: a single key, a key combination, a reactive signal of either, or a custom predicate.

<Demo name="on-key" />

## Usage

```angular-ts
import { Component } from '@angular/core';
import { onKey } from '@signality/core';

@Component({
  template: `<p>Press ⌘K</p>`,
})
export class HotkeyDemo {
  constructor() {
    onKey(['Meta', 'K'], event => { // [!code highlight]
      event.preventDefault();
      console.log('Command palette!');
    });
  }
}
```

## Parameters

| Parameter | Type                             | Description                                                                                    |
|-----------|----------------------------------|------------------------------------------------------------------------------------------------|
| `key`     | `KeyFilter`                      | Key filter: `event.key` string, key combination array, signal of either, or a custom predicate |
| `handler` | `(event: KeyboardEvent) => void` | Callback invoked with the matching keyboard event                                              |
| `options` | `OnKeyOptions`                   | Optional configuration (see [Options](#options) below)                                         |

The `key` parameter can be omitted — `onKey(handler, options?)` fires on every keyboard event.

### Key filter semantics

- **String** — matched against [`event.key`](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key). Modifier flags are ignored: the filter `'s'` also matches <kbd>Ctrl</kbd>+<kbd>S</kbd> or <kbd>Shift</kbd>+<kbd>S</kbd>.
- **Array** — a key **combination** (all keys together): modifier keys (`'Meta'`, `'Control'`, `'Alt'`, `'Shift'`) plus at most one regular key. The match is **exact** — an extra pressed modifier prevents it, so `['Meta', 'K']` does not match <kbd>Meta</kbd>+<kbd>Shift</kbd>+<kbd>K</kbd>. The order of keys in the array does not matter. An array of only modifiers (e.g. `['Control', 'Shift']`) fires on the keydown that completes the combination.
- **Signal** — a `Signal<string | string[]>` re-binds the listener whenever its value changes.
- **Predicate** — full control: `event => boolean`. Use it for "any of" (OR) matching, which arrays intentionally do not provide: `event => ['Escape', 'Enter'].includes(event.key)`.

Key names follow the canonical [`event.key` values](https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values), and common aliases are resolved automatically (case-insensitively): `'Ctrl'` → `'Control'`; `'Cmd'`, `'Command'`, `'Win'` → `'Meta'`; `'Option'`, `'Opt'` → `'Alt'`; `'Esc'` → `'Escape'`; `'Del'` → `'Delete'`; `'Return'` → `'Enter'`; `'Space'` → `' '`.

::: tip Letter case
Single-character keys are compared **case-insensitively** in both string and array filters: `'k'`, `['Meta', 'k']`, and `['Meta', 'K']` are equivalent, so the state of <kbd>CapsLock</kbd> does not affect matching. Multi-character key names (`'Enter'`, `'ArrowDown'`) are compared exactly. Shifted symbols are matched by the produced character, e.g. `['Control', 'Shift', '!']`. For strict case-sensitive matching, use a predicate: `event => event.key === 'a'`.
:::

## Options

The `OnKeyOptions` extends `WithInjector`:

| Option      | Type                                                                                                              | Default     | Description                                                 |
|-------------|-------------------------------------------------------------------------------------------------------------------|-------------|-------------------------------------------------------------|
| `target`    | [`MaybeElementSignal<HTMLElement>`](/reference/utility-types#maybeelementsignal-lt-type-gt) `\| Window \| Document` | `window`    | Event target to listen on                                   |
| `eventName` | `'keydown' \| 'keyup'`                                                                                              | `'keydown'` | Keyboard event to listen for                                |
| `passive`   | `boolean`                                                                                                           | `false`     | Register the listener as passive                            |
| `dedupe`    | [`MaybeSignal<boolean>`](/reference/utility-types#maybesignal-lt-type-gt)                                           | `false`     | Ignore repeated events while the key is held (`event.repeat`) |
| `injector`  | [`Injector`](https://angular.dev/api/core/Injector)                                                                 | -           | Optional injector for DI context                            |

## Return Value

Returns an `OnKeyRef` with a `destroy` method to stop listening:

| Property  | Type         | Description                          |
|-----------|--------------|--------------------------------------|
| `destroy` | `() => void` | Stops listening for keyboard events |

## Examples

### Single key

```angular-ts
import { Component, signal } from '@angular/core';
import { onKey } from '@signality/core';

@Component({
  template: `<dialog [open]="isOpen()">Press Escape to close</dialog>`,
})
export class EscapeDemo {
  readonly isOpen = signal(true);

  constructor() {
    onKey('Escape', () => this.isOpen.set(false)); // [!code highlight]
  }
}
```

### Reactive filter

```angular-ts
import { Component, signal } from '@angular/core';
import { onKey } from '@signality/core';

@Component({
  template: `<button (click)="hotkey.set(['Meta', 'P'])">Rebind</button>`,
})
export class ReactiveDemo {
  readonly hotkey = signal<string[]>(['Meta', 'K']);

  constructor() {
    // Changing the signal re-binds the listener automatically
    onKey(this.hotkey, event => { // [!code highlight]
      event.preventDefault();
      console.log('Hotkey pressed!');
    });
  }
}
```

### "Any of" matching with a predicate

```angular-ts
import { Component } from '@angular/core';
import { onKey } from '@signality/core';

@Component({ template: `` })
export class SubmitOrDismissDemo {
  constructor() {
    onKey(
      event => ['Escape', 'Enter'].includes(event.key), // [!code highlight]
      event => console.log('Dismiss or submit:', event.key)
    );
  }
}
```

### Element target and dedupe

```angular-ts
import { Component, viewChild, ElementRef } from '@angular/core';
import { onKey } from '@signality/core';

@Component({
  template: `<input #search placeholder="Search…" />`,
})
export class SearchDemo {
  readonly search = viewChild<ElementRef>('search');

  constructor() {
    onKey('ArrowDown', event => console.log('Next suggestion'), {
      target: this.search, // [!code highlight]
      dedupe: true, // [!code highlight]
    });
  }
}
```

## SSR Compatibility

On the server, the utility returns a no-op ref with an empty `destroy` method.

## Type Definitions

```typescript
type KeyPredicate = (event: KeyboardEvent) => boolean;

type KeyFilter = MaybeSignal<string | string[]> | KeyPredicate;

interface OnKeyOptions extends WithInjector {
  readonly target?: MaybeElementSignal<HTMLElement> | Window | Document;
  readonly eventName?: 'keydown' | 'keyup';
  readonly passive?: boolean;
  readonly dedupe?: MaybeSignal<boolean>;
}

interface OnKeyRef {
  readonly destroy: () => void;
}

function onKey(
  key: KeyFilter,
  handler: (event: KeyboardEvent) => void,
  options?: OnKeyOptions
): OnKeyRef;

function onKey(handler: (event: KeyboardEvent) => void, options?: OnKeyOptions): OnKeyRef;
```

## Related

- [Listener](/browser/listener) — Low-level event listener utility
- [OnClickOutside](/elements/on-click-outside) — Detect clicks outside an element
- [OnLongPress](/elements/on-long-press) — Detect long press gestures

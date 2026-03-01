---
source: https://github.com/signalityjs/signality/blob/main/projects/core/browser/text-direction/index.ts
---

# TextDirection

Reactive read/write wrapper around an element's [`dir`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/dir) attribute for detecting and controlling text directionality.

<Demo name="text-direction" />

## Usage

```angular-ts
import { Component } from '@angular/core';
import { textDirection } from '@signality/core';

@Component({
  template: `
    <p>Current direction: {{ dir() }}</p>
    <button (click)="dir.set('rtl')">RTL</button>
    <button (click)="dir.set('ltr')">LTR</button>
  `,
})
export class TextDirectionDemo {
  readonly dir = textDirection(); // [!code highlight]
}
```

::: warning Use InjectionToken for Singleton
For global state tracking like `textDirection`, consider using the provided `TEXT_DIRECTION` token instead of calling the function directly. This provides a singleton instance that can be shared across your entire application, reducing memory usage and event listener overhead:

```typescript
import { inject } from '@angular/core';
import { TEXT_DIRECTION } from '@signality/core';

const dir = textDirection(); // [!code --]
const dir = inject(TEXT_DIRECTION); // [!code ++]
```

Learn more about [Token-based utilities](/guide/key-concepts#token-based-utilities).
:::

## Parameters

| Parameter | Type                     | Description                                            |
|-----------|--------------------------|--------------------------------------------------------|
| `options` | `TextDirectionOptions`   | Optional configuration (see [Options](#options) below) |

## Options

The `TextDirectionOptions` extends `CreateSignalOptions<TextDirection>` and `WithInjector`:

| Option         | Type                                                                                      | Default                      | Description                                         |
|----------------|-------------------------------------------------------------------------------------------|------------------------------|-----------------------------------------------------|
| `target`       | [`MaybeElementSignal<HTMLElement>`](/reference/utility-types#maybeelementsignal-lt-type-gt) | `document.documentElement`   | Element to observe                                  |
| `initialValue` | `TextDirection`                                                                           | `'ltr'`                      | Initial direction value used before the DOM is read |
| `equal`        | `(a: TextDirection, b: TextDirection) => boolean`                                         | -                            | Custom equality function for the signal             |
| `injector`     | [`Injector`](https://angular.dev/api/core/Injector)                                       | -                            | Optional injector for DI context                    |

## Return Value

Returns a `WritableSignal<TextDirection>`:

- **Read** — call the signal to get the current direction (`'ltr'`, `'rtl'`, or `'auto'`)
- **Write** — call `.set(dir)` to update both the signal and the element's `dir` attribute

External changes to the `dir` attribute are automatically tracked via MutationObserver and reflected in the signal.

## Examples

### RTL support toggle

```angular-ts
import { Component, computed } from '@angular/core';
import { textDirection } from '@signality/core';

@Component({
  template: `
    <button (click)="toggle()">
      Switch to {{ isRtl() ? 'LTR' : 'RTL' }}
    </button>
  `,
})
export class RtlToggle {
  readonly dir = textDirection();
  readonly isRtl = computed(() => this.dir() === 'rtl');

  toggle() {
    this.dir.set(this.isRtl() ? 'ltr' : 'rtl');
  }
}
```

### Observe specific element

```angular-ts
import { Component, viewChild, ElementRef } from '@angular/core';
import { textDirection } from '@signality/core';

@Component({
  template: `
    <div #content dir="auto">
      <p>Direction: {{ dir() }}</p>
    </div>
  `,
})
export class ElementDirectionDemo {
  readonly content = viewChild<ElementRef>('content');
  readonly dir = textDirection({ target: this.content }); // [!code highlight]
}
```

## SSR Compatibility

On the server, returns a regular `WritableSignal` initialized with `'ltr'` (or the provided `initialValue`).

## Type Definitions

```typescript
type TextDirection = 'ltr' | 'rtl' | 'auto';

interface TextDirectionOptions extends CreateSignalOptions<TextDirection>, WithInjector {
  readonly target?: MaybeElementSignal<HTMLElement>;
  readonly initialValue?: TextDirection;
}

function textDirection(options?: TextDirectionOptions): WritableSignal<TextDirection>;
```

## Related

- [BrowserLanguage](/browser/browser-language) — Reactive browser language detection

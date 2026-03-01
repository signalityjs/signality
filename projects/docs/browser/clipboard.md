---
source: https://github.com/signalityjs/signality/blob/main/projects/core/browser/clipboard/index.ts
---

# Clipboard

Reactive wrapper around the [Clipboard API](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API). Read and write clipboard content with Angular signals.

::: warning Secure Context Required
This feature is available only in [secure contexts](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Secure_Contexts) (HTTPS) or potentially trustworthy origins (such as `localhost` or `127.0.0.1`). Regular `http://` URLs will not work in most browsers.
:::

<Demo name="clipboard" />

## Usage

```angular-ts
import { Component } from '@angular/core';
import { clipboard } from '@signality/core';

@Component({
  template: `
    <input [(ngModel)]="textToCopy" />
    <button (click)="cb.copy(textToCopy())">Copy</button>
    <button (click)="cb.paste()">Paste</button>
    <p>Clipboard: {{ cb.text() }}</p>
  `,
})
export class ClipboardDemo {
  readonly cb = clipboard(); // [!code highlight]
  readonly textToCopy = signal('');
}
```

## Parameters

| Parameter | Type               | Description                                            |
|-----------|--------------------|--------------------------------------------------------|
| `options` | `ClipboardOptions` | Optional configuration (see [Options](#options) below) |

## Options

| Option           | Type                  | Default | Description                                    |
|------------------|-----------------------|---------|------------------------------------------------|
| `copiedDuration` | [`MaybeSignal<number>`](/reference/utility-types#maybesignal-lt-type-gt) | `1500`  | How long `copied` stays `true` after copy (ms) |
| `injector`       | [`Injector`](https://angular.dev/api/core/Injector)            | -       | Optional injector for DI context               |

## Return Value

The `clipboard()` function returns a `ClipboardRef` object:

| Property      | Type                              | Description                                                |
|---------------|-----------------------------------|------------------------------------------------------------|
| `text`        | `Signal<string>`                  | Current clipboard text content                             |
| `copied`      | `Signal<boolean>`                 | Whether content was recently copied (resets after timeout) |
| `isSupported` | `Signal<boolean>`                 | Whether Clipboard API is supported                         |
| `copy`        | `(text: string) => Promise<void>` | Copy text to clipboard                                     |
| `paste`       | `() => Promise<string>`           | Read text from clipboard                                   |

## Examples

### Copy button with feedback

```angular-ts
import { Component, input } from '@angular/core';
import { clipboard } from '@signality/core';

@Component({
  selector: 'copy-button',
  template: `
    <button 
      (click)="copyCode()" 
      [class.copied]="cb.copied()"
    >
      {{ cb.copied() ? '✓ Copied!' : 'Copy' }}
    </button>
  `,
})
export class CopyButton {
  readonly code = input.required<string>();
  readonly duration = input(2000);
  readonly cb = clipboard({ copiedDuration: this.duration }); // [!code highlight]
  
  async copyCode() {
    await this.cb.copy(this.code());
  }
}
```

### Paste from clipboard

```angular-ts
import { Component, signal } from '@angular/core';
import { clipboard } from '@signality/core';

@Component({
  template: `
    <button (click)="pasteContent()">Paste from clipboard</button>
    <pre>{{ content() }}</pre>
  `,
})
export class PasteDemo {
  readonly cb = clipboard();
  readonly content = signal('');
  
  async pasteContent() {
    const text = await this.cb.paste();
    this.content.set(text);
  }
}
```

## Browser Compatibility

The Clipboard API has limited browser support and requires a secure context (HTTPS). Always check `isSupported()` before using clipboard functionality (see [Browser API support detection](/guide/key-concepts#browser-api-support-detection)):

```angular-html
@if (cb.isSupported()) {
  <button (click)="cb.copy(text)">Copy</button>
  <button (click)="cb.paste()">Paste</button>
} @else {
  <p>Clipboard API is not available in this browser</p>
}
```

For detailed browser support information, see [Can I use: Clipboard API](https://caniuse.com/clipboard).

## SSR Compatibility

On the server, signals initialize with safe defaults:

- `text` → `''`
- `copied` → `false`
- `isSupported` → `false`
- `copy`, `paste` → no-op async functions

## Type Definitions

```typescript
interface ClipboardOptions extends WithInjector {
  readonly copiedDuration?: MaybeSignal<number>;
}

interface ClipboardRef {
  readonly text: Signal<string>;
  readonly copied: Signal<boolean>;
  readonly isSupported: Signal<boolean>;
  readonly copy: (text: string) => Promise<void>;
  readonly paste: () => Promise<string>;
}

function clipboard(options?: ClipboardOptions): ClipboardRef;
```

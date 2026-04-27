---
source: https://github.com/signalityjs/signality/blob/main/projects/core/browser/text-selection/index.ts
---

# TextSelection

Reactive tracking of text selection using the [Selection API](https://developer.mozilla.org/en-US/docs/Web/API/Selection). Track what text the user has selected.

<Demo name="text-selection" />

## Usage

```angular-ts
import { Component } from '@angular/core';
import { textSelection } from '@signality/core';

@Component({
  template: `
    <p>Select some text in this paragraph to see it reflected below.</p>
    <p>Selected: "{{ selection.text() }}"</p>
  `,
})
export class SelectionDemo {
  readonly selection = textSelection(); // [!code highlight]
}
```

::: warning Use InjectionToken for Singleton
For global state tracking like `textSelection`, consider using the provided `TEXT_SELECTION` token instead of calling the function directly. This provides a singleton instance that can be shared across your entire application, reducing memory usage and event listener overhead:

```typescript
import { inject } from '@angular/core';
import { TEXT_SELECTION } from '@signality/core';

const selection = textSelection(); // [!code --]
const selection = inject(TEXT_SELECTION); // [!code ++]
```

Learn more about [Token-based utilities](/guide/key-concepts#token-based-utilities).
:::

## Parameters

| Parameter | Type                   | Description                                            |
|-----------|------------------------|--------------------------------------------------------|
| `options` | `TextSelectionOptions` | Optional configuration (see [Options](#options) below) |

## Options

The `TextSelectionOptions` extends `WithInjector`:

| Option     | Type                                                | Description                                                                                                                    |
|------------|-----------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------|
| `root`     | `MaybeElementSignal<Element>`                       | Optional element to track selection within. When provided, only selections entirely contained within this element are tracked. |
| `injector` | [`Injector`](https://angular.dev/api/core/Injector) | Optional injector for DI context                                                                                               |

## Return Value

The `textSelection()` function returns a `TextSelectionRef` object:

| Property    | Type                        | Description                                                                                                |
|-------------|-----------------------------|------------------------------------------------------------------------------------------------------------|
| `text`      | `Signal<string>`            | The selected text content                                                                                  |
| `ranges`    | `Signal<Range[]>`           | Array of [Range](https://developer.mozilla.org/en-US/docs/Web/API/Range) objects                           |
| `rects`     | `Signal<DOMRect[]>`         | Bounding rectangles of selection (see [DOMRect](https://developer.mozilla.org/en-US/docs/Web/API/DOMRect)) |
| `selection` | `Signal<Selection \| null>` | The raw [Selection](https://developer.mozilla.org/en-US/docs/Web/API/Selection) object                     |
| `clear`     | `() => void`                | Clear the current text selection                                                                           |

## Examples

### Quote selection

Use the `root` option to track selections only within a specific element:

```angular-ts
import { Component, ElementRef, viewChild } from '@angular/core';
import { textSelection } from '@signality/core';

@Component({
  template: `
    <article #root>
      <p>Select text to save as a quote...</p>
    </article>
    @if (selection.text()) {
      <button (click)="saveQuote()">Save Quote</button>
    }
  `
})
export class QuoteCollector {
  readonly root = viewChild('root', { read: ElementRef });
  readonly selection = textSelection({ root: this.root }); // [!code highlight]
  
  saveQuote() {
    const text = this.selection.text().trim();
    // ...
  }
}
```

## SSR Compatibility

On the server, signals initialize with safe defaults:

- `text()` → `''`
- `ranges()` → `[]`
- `rects()` → `[]`
- `selection()` → `null`
- `clear()` → no-op function

## Type Definitions

```typescript
interface TextSelectionOptions extends WithInjector {
  readonly root?: MaybeElementSignal<Element>;
}

interface TextSelectionRef {
  readonly text: Signal<string>;
  readonly ranges: Signal<Range[]>;
  readonly rects: Signal<DOMRect[]>;
  readonly selection: Signal<Selection | null>;
  readonly clear: () => void;
}

function textSelection(options?: TextSelectionOptions): TextSelectionRef;

const TEXT_SELECTION: InjectionToken<TextSelectionRef>;
```

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

| Option     | Type                                                | Description                      |
|------------|-----------------------------------------------------|----------------------------------|
| `injector` | [`Injector`](https://angular.dev/api/core/Injector) | Optional injector for DI context |

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

### Word counter

```angular-ts
import { Component, computed } from '@angular/core';
import { textSelection } from '@signality/core';

@Component({
  template: `
    <textarea>
      Type or paste text here, then select portions to count.
    </textarea>
    
    <div class="stats">
      @if (hasSelection()) {
        <p>Selected: {{ wordCount() }} words, {{ charCount() }} characters</p>
      }
    </div>
  `,
})
export class SelectionCounter {
  readonly selection = textSelection();
  
  readonly charCount = computed(() => this.selection.text().length);
  readonly hasSelection = computed(() => this.charCount() > 0);
  
  readonly wordCount = computed(() => {
    const text = this.selection.text().trim();
    if (!text) return 0;
    return text.split(/\s+/).length;
  });
}
```

### Quote selection

```angular-ts
import { Component, computed, signal } from '@angular/core';
import { textSelection } from '@signality/core';

interface Quote {
  text: string;
  savedAt: number;
}

@Component({
  template: `
    <article>
      <p>Select text to save as a quote...</p>
    </article>
    
    @if (selection.text()) {
      <button (click)="saveQuote()">Save Quote</button>
    }
    
    <div class="saved-quotes">
      <h3>Saved Quotes</h3>
      @for (quote of quotes(); track quote.savedAt) {
        <blockquote>{{ quote.text }}</blockquote>
      }
    </div>
  `,
})
export class QuoteCollector {
  readonly selection = textSelection();
  readonly quotes = signal<Quote[]>([]);
  
  saveQuote() {
    const text = this.selection.text().trim();
    if (text) {
      this.quotes.update(quotes => [
        ...quotes,
        { text, savedAt: Date.now() }
      ]);
      
      this.selection.clear(); // [!code highlight]
    }
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
type TextSelectionOptions = WithInjector;

interface TextSelectionRef {
  readonly text: Signal<string>;
  readonly ranges: Signal<Range[]>;
  readonly rects: Signal<DOMRect[]>;
  readonly selection: Signal<Selection | null>;
  readonly clear: () => void;
}

function textSelection(options?: TextSelectionOptions): TextSelectionRef;
```

---
source: https://github.com/signalityjs/signality/blob/main/projects/core/elements/active-element/index.ts
---

# ActiveElement

Reactive tracking of the currently focused element in the document. Wraps [`document.activeElement`](https://developer.mozilla.org/en-US/docs/Web/API/Document/activeElement) as an Angular signal.

<Demo name="active-element" />

## Usage

```angular-ts
import { Component } from '@angular/core';
import { activeElement } from '@signality/core';

@Component({
  template: `
    <input placeholder="Enter your name" />
    <button>Submit</button>
    <p>Active: {{ activeEl()?.tagName }}</p>
  `,
})
export class ActiveElementDemo {
  readonly activeEl = activeElement(); // [!code highlight]
}
```

::: warning Use InjectionToken for Singleton
For global state tracking like `activeElement`, consider using the provided `ACTIVE_ELEMENT` token instead of calling the function directly. This provides a singleton instance that can be shared across your entire application, reducing memory usage and event listener overhead:

```typescript
import { inject } from '@angular/core';
import { ACTIVE_ELEMENT } from '@signality/core';

const activeEl = activeElement(); // [!code --]
const activeEl = inject(ACTIVE_ELEMENT); // [!code ++]
```

Learn more about [Token-based utilities](/guide/key-concepts#token-based-utilities).
:::

## Parameters

| Parameter | Type                   | Description                                            |
|-----------|------------------------|--------------------------------------------------------|
| `options` | `ActiveElementOptions` | Optional configuration (see [Options](#options) below) |

## Options

The `ActiveElementOptions` extends [`CreateSignalOptions<Element | null>`](https://angular.dev/api/core/CreateSignalOptions) and `WithInjector`:

| Option      | Type                                                                               | Description                                                                                        |
|-------------|------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------|
| `equal`     | [`ValueEqualityFn<Element \| null>`](https://angular.dev/api/core/ValueEqualityFn) | Custom equality function ([see more](https://angular.dev/guide/signals#signal-equality-functions)) |
| `debugName` | `string`                                                                           | Debug name for the signal (development only)                                                       |
| `injector`  | [`Injector`](https://angular.dev/api/core/Injector)                                | Optional injector for DI context                                                                   |

## Return Value

Returns a `Signal<Element | null>` that reflects the currently focused element. The value depends on the current focus state:

| Signal value      | When                                                                                       |
|-------------------|--------------------------------------------------------------------------------------------|
| Focused `Element` | An interactive element (input, button, link, `[tabindex]`, etc.) has focus                 |
| `<body>`          | No interactive element has focus — the browser defaults `activeElement` to `document.body`  |
| `null`            | The document itself has no focus (e.g. the browser window is blurred), or during SSR       |

::: info Shadow DOM
Unlike native `document.activeElement`, this utility traverses open Shadow DOM boundaries and returns the **deepest** focused element inside shadow trees. The native API would return the shadow host instead.
:::

## Examples

### Focus indicator

```angular-ts
import { Component, computed } from '@angular/core';
import { activeElement } from '@signality/core';

@Component({
  template: `
    <div class="form">
      <input name="email" placeholder="Email" />
      <input name="password" type="password" placeholder="Password" />
    </div>
    
    <p class="hint">{{ hint() }}</p>
  `,
})
export class FocusHints {
  readonly activeEl = activeElement();
  
  readonly hint = computed(() => {
    const el = this.activeEl();
    
    if (!(el instanceof HTMLInputElement)) {
      return '';
    }
    
    switch (el.name) {
      case 'email': return 'Enter your email address';
      case 'password': return 'Minimum 8 characters';
      default: return '';
    }
  });
}
```

### Focus trap

A **focus trap** keeps keyboard focus confined within a specific region (e.g. a modal dialog) while it's open. Without it, pressing <kbd>Tab</kbd> would move focus outside the dialog — breaking keyboard navigation and accessibility. See the [WAI-ARIA dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) for the full spec.

```angular-ts
import { Component, viewChild, ElementRef, effect } from '@angular/core';
import { activeElement } from '@signality/core';

@Component({
  template: `
    <div #modal class="modal">
      <button #first>First</button>
      <button>Middle</button>
      <button #last>Last</button>
    </div>
  `,
})
export class FocusTrapModal {
  readonly activeEl = activeElement();
  readonly modal = viewChild<ElementRef>('modal');
  readonly firstEl = viewChild<ElementRef>('first');
  readonly lastEl = viewChild<ElementRef>('last');
  
  constructor() {
    effect(() => {
      const modalEl = this.modal()?.nativeElement;
      const activeEl = this.activeEl();
      
      if (modalEl && activeEl && !modalEl.contains(activeEl)) {
        // Focus escaped modal, bring it back
        this.firstEl()?.nativeElement.focus();
      }
    });
  }
}
```

## SSR Compatibility

On the server, the signal initializes with `null`.

## Type Definitions

```typescript
type ActiveElementOptions = CreateSignalOptions<Element | null> & WithInjector;

function activeElement(options?: ActiveElementOptions): Signal<Element | null>;

const ACTIVE_ELEMENT: InjectionToken<Signal<Element | null>>;
```

## Related

- [ElementFocus](/elements/element-focus) — Track focus on specific element

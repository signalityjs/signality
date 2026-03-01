---
source: https://github.com/signalityjs/signality/blob/main/projects/core/elements/element-focus/index.ts
---

# ElementFocus

Reactive tracking of focus state on an element. Detects when an element gains or loses focus.

<Demo name="element-focus" />

## Usage

```angular-ts
import { Component, viewChild, ElementRef } from '@angular/core';
import { elementFocus } from '@signality/core';

@Component({
  template: `
    <input #input [class.focused]="focused()" />
    <p>{{ focused() ? 'Input is focused' : 'Input is not focused' }}</p>
  `,
})
export class FocusDemo {
  readonly input = viewChild<ElementRef>('input');
  readonly focused = elementFocus(this.input); // [!code highlight]
}
```

## Parameters

| Parameter | Type                              | Description                                            |
|-----------|-----------------------------------|--------------------------------------------------------|
| `target`  | [`MaybeElementSignal<HTMLElement>`](/reference/utility-types#maybeelementsignal-lt-type-gt) | Target element to track                                |
| `options` | `ElementFocusOptions`             | Optional configuration (see [Options](#options) below) |

## Options

The `ElementFocusOptions` extends [`CreateSignalOptions<boolean>`](https://angular.dev/api/core/CreateSignalOptions) and `WithInjector`:

| Option         | Type                       | Default | Description                                                                                                            |
|----------------|----------------------------|---------|------------------------------------------------------------------------------------------------------------------------|
| `equal`        | [`ValueEqualityFn<boolean>`](https://angular.dev/api/core/ValueEqualityFn) | -       | Custom equality function ([see more](https://angular.dev/guide/signals#signal-equality-functions)) |
| `debugName`    | `string`                   | -       | Debug name for the signal (development only)                                                                           |
| `focusVisible` | `boolean`                  | `false` | Track focus using the `:focus-visible` pseudo-class. The browser uses heuristics to determine when focus should be visually indicated (e.g., keyboard navigation, programmatic focus). See [MDN: :focus-visible](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:focus-visible) for details. |
| `injector`     | [`Injector`](https://angular.dev/api/core/Injector)                 | -       | Optional injector for DI context                                                                                       |

## Return Value

Returns a `Signal<boolean>` containing `true` when the element has focus, `false` otherwise.

## Examples

### Focus ring

```angular-ts
import { Component, viewChild, ElementRef } from '@angular/core';
import { elementFocus } from '@signality/core';

@Component({
  template: `
    <button #btn [class.focus-ring]="focused()">
      Click or Tab to me
    </button>
  `,
})
export class FocusRing {
  readonly btn = viewChild<ElementRef>('btn');
  readonly focused = elementFocus(this.btn, { focusVisible: true }); // [!code highlight]
}
```

### Form field with label animation

```angular-ts
import { Component, viewChild, ElementRef, computed } from '@angular/core';
import { elementFocus } from '@signality/core';

@Component({
  template: `
    <div class="form-field" [class.active]="isActive()">
      <label [class.floating]="isActive()">Email</label>
      <input #input [value]="value" (input)="value = $any($event.target).value" />
    </div>
  `,
})
export class FloatingLabel {
  readonly input = viewChild<ElementRef>('input');
  readonly isFocused = elementFocus(this.input);
  
  value = '';
  
  readonly isActive = computed(() => 
    this.isFocused() || this.value.length > 0 // [!code highlight]
  );
}
```

### Search with focus state

```angular-ts
import { Component, viewChild, ElementRef, computed } from '@angular/core';
import { elementFocus } from '@signality/core';

@Component({
  template: `
    <div class="search-container" [class.expanded]="isExpanded()">
      <input 
        #searchInput 
        placeholder="Search..." 
        [value]="query"
        (input)="query = $any($event.target).value"
      />
      @if (isExpanded()) {
        <div class="search-suggestions">
          <!-- Suggestions here -->
        </div>
      }
    </div>
  `,
})
export class ExpandingSearch {
  readonly searchInput = viewChild<ElementRef>('searchInput');
  readonly isFocused = elementFocus(this.searchInput);
  
  query = '';
  
  readonly isExpanded = computed(() => 
    this.isFocused() || this.query.length > 0
  );
}
```

## SSR Compatibility

On the server, the signal initializes with `false`.

## Type Definitions

```typescript
type ElementFocusOptions = CreateSignalOptions<boolean> &
  WithInjector & {
  readonly focusVisible?: boolean;
};

function elementFocus(
  target: MaybeElementSignal<HTMLElement>,
  options?: ElementFocusOptions
): Signal<boolean>;
```

## Related

- [ElementHover](/elements/element-hover) — Track hover state instead of focus
- [ActiveElement](/elements/active-element) — Track the currently focused element globally

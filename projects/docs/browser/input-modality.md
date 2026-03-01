---
source: https://github.com/signalityjs/signality/blob/main/projects/core/browser/input-modality/index.ts
---

# InputModality

Reactively track the user's current input method (keyboard, mouse, or touch).

<Demo name="input-modality-browser" />

## Usage

```angular-ts
import { Component, computed } from '@angular/core';
import { inputModality } from '@signality/core';

@Component({
  template: `
    <div [class]="'input-mode-' + modality()">
      <p>Current input: {{ modality() ?? 'none' }}</p>
      <p>Using keyboard: {{ isKeyboard() }}</p>
    </div>
  `,
})
export class InputDemo {
  readonly modality = inputModality(); // [!code highlight]
  readonly isKeyboard = computed(() => this.modality() === 'keyboard');
}
```

::: warning Use InjectionToken for Singleton
For global state tracking like `inputModality`, consider using the provided `INPUT_MODALITY` token instead of calling the function directly. This provides a singleton instance that can be shared across your entire application, reducing memory usage and event listener overhead:

```typescript
import { inject } from '@angular/core';
import { INPUT_MODALITY } from '@signality/core';

const modality = inputModality(); // [!code --]
const modality = inject(INPUT_MODALITY); // [!code ++]
```

Learn more about [Token-based utilities](/guide/key-concepts#token-based-utilities).
:::

## Parameters

| Parameter | Type           | Description                                            |
|-----------|----------------|--------------------------------------------------------|
| `options` | `WithInjector` | Optional configuration (see [Options](#options) below) |

## Options

The `WithInjector` interface provides:

| Option     | Type       | Description                      |
|------------|------------|----------------------------------|
| `injector` | [`Injector`](https://angular.dev/api/core/Injector) | Optional injector for DI context |

## Return Value

The `inputModality()` function returns a `Signal<InputModality>`:

- `'keyboard'` — User is using keyboard input
- `'mouse'` — User is using mouse input
- `'touch'` — User is using touch input
- `null` — No input detected yet

## Examples

### Touch-optimized UI

```angular-ts
import { Component, computed } from '@angular/core';
import { inputModality } from '@signality/core';

@Component({
  template: `
    <nav [class.touch-mode]="isTouch()">
      <button [style.padding]="buttonPadding()">Menu</button>
      <button [style.padding]="buttonPadding()">Settings</button>
    </nav>
  `,
})
export class AdaptiveNav {
  readonly modality = inputModality();
  readonly isTouch = computed(() => this.modality() === 'touch');
  
  // larger touch targets for touch input
  readonly buttonPadding = computed(() => 
    this.isTouch() ? '1rem 2rem' : '0.5rem 1rem'
  );
}
```

### Analytics tracking

```angular-ts
import { Component, effect, inject } from '@angular/core';
import { inputModality } from '@signality/core';
import { AnalyticsService } from './analytics.service';

@Component({ /* ... */ })
export class AppComponent {
  readonly analytics = inject(AnalyticsService);
  readonly modality = inputModality();
  
  constructor() {
    effect(() => {
      const current = this.modality();
      if (current) {
        this.analytics.setUserProperty('input_modality', current);
      }
    });
  }
}
```

### Conditional tooltips

```angular-ts
import { Component, computed } from '@angular/core';
import { inputModality } from '@signality/core';

@Component({
  template: `
    <button 
      [attr.title]="showTooltip() ? 'Click to save' : null"
    >
      💾
    </button>
  `,
})
export class SaveButton {
  readonly modality = inputModality();
  
  // Only show native tooltips for mouse users
  readonly showTooltip = computed(() => this.modality() === 'mouse');
}
```

## SSR Compatibility

On the server, the signal initializes with `null`.

## Type Definitions

```typescript
type InputModality = 'keyboard' | 'mouse' | 'touch' | null;

function inputModality(options?: WithInjector): Signal<InputModality>;

export const INPUT_MODALITY: InjectionToken<Signal<InputModality>>;
```

## Related

- [ActiveElement](/elements/active-element) — Track currently focused element
- [ElementFocus](/elements/element-focus) — Track focus state of specific element

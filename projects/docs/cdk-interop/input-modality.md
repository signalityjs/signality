---
source: https://github.com/signalityjs/signality/blob/main/projects/cdk-interop/input-modality/index.ts
---

# InputModality

Signal-based wrapper around Angular CDK's [InputModalityDetector](https://material.angular.io/cdk/a11y/api#InputModalityDetector). Reactively track the user's current input method (keyboard, mouse, or touch).

::: warning Recommended: Use Core Package
If you're not using `@angular/cdk` in your project, we recommend using `inputModality` from `@signality/core` instead. It provides the same functionality without requiring the CDK dependency:

```typescript
import { inputModality } from '@signality/core'; // [!code ++]
import { inputModality } from '@signality/cdk-interop'; // [!code --]
```

See [InputModality from core](/browser/input-modality) for more details.
:::

::: warning CDK Interop Package Required
This utility requires the `@signality/cdk-interop` and `@angular/cdk` packages to be installed:

```bash
npm install @signality/cdk-interop @angular/cdk
```

:::

## Usage

```angular-ts
import { Component, computed } from '@angular/core';
import { inputModality } from '@signality/cdk-interop';

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

## Parameters

| Parameter | Type                   | Description                                            |
|-----------|------------------------|--------------------------------------------------------|
| `options` | `InputModalityOptions` | Optional configuration (see [Options](#options) below) |

## Options

The `InputModalityOptions` extends [`CreateSignalOptions<InputModality>`](https://angular.dev/api/core/CreateSignalOptions) and `WithInjector`:

| Option      | Type                                                                             | Description                                                                                        |
|-------------|----------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------|
| `equal`     | [`ValueEqualityFn<InputModality>`](https://angular.dev/api/core/ValueEqualityFn) | Custom equality function ([see more](https://angular.dev/guide/signals#signal-equality-functions)) |
| `debugName` | `string`                                                                         | Debug name for the signal (development only)                                                       |
| `injector`  | [`Injector`](https://angular.dev/api/core/Injector)                              | Optional injector for DI context                                                                   |

## Return Value

Returns a `Signal<InputModality>` containing the current input modality: `'keyboard'`, `'mouse'`, `'touch'`, or `null`.

## Examples

### Touch-optimized UI

```angular-ts
import { Component, computed } from '@angular/core';
import { inputModality } from '@signality/cdk-interop';

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
  
  // Larger touch targets for touch input
  readonly buttonPadding = computed(() => 
    this.isTouch() ? '1rem 2rem' : '0.5rem 1rem' // [!code highlight]
  );
}
```

### Analytics tracking

```angular-ts
import { Component, effect, inject } from '@angular/core';
import { inputModality } from '@signality/cdk-interop';
import { AnalyticsService } from './analytics.service';

@Component({ /* ... */ })
export class AppComponent {
  readonly analytics = inject(AnalyticsService);
  readonly modality = inputModality();
  
  constructor() {
    effect(() => {
      const current = this.modality();
      if (current) {
        this.analytics.setUserProperty('input_modality', current); // [!code highlight]
      }
    });
  }
}
```

### Conditional tooltips

```angular-ts
import { Component, computed } from '@angular/core';
import { inputModality } from '@signality/cdk-interop';

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
  readonly showTooltip = computed(() => this.modality() === 'mouse'); // [!code highlight]
}
```

## Type Definitions

```typescript
type InputModalityOptions = CreateSignalOptions<InputModality> & WithInjector;

function inputModality(options?: InputModalityOptions): Signal<InputModality>;

const INPUT_MODALITY: InjectionToken<Signal<InputModality>>;
```

## Related

- [focusMonitor](/cdk-interop/focus-monitor) — Monitor focus state with origin detection

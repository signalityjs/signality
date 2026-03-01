---
source: https://github.com/signalityjs/signality/blob/main/projects/core/browser/eye-dropper/index.ts
---

# EyeDropper

Reactive wrapper around the [EyeDropper API](https://developer.mozilla.org/en-US/docs/Web/API/EyeDropper_API). Sample colors from anywhere on the screen with Angular signals.

::: warning Secure Context Required
This feature is available only in [secure contexts](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Secure_Contexts) (HTTPS) or potentially trustworthy origins (such as `localhost` or `127.0.0.1`). Regular `http://` URLs will not work in most browsers.
:::

<Demo name="eye-dropper" />

## Usage

```angular-ts
import { Component } from '@angular/core';
import { eyeDropper } from '@signality/core';

@Component({
  template: `
    <button (click)="pickColor()">Pick Color</button>
    @if (color()) {
      <div [style.background-color]="color()">{{ color() }}</div>
    }
  `,
})
export class ColorPicker {
  readonly eyeDropper = eyeDropper(); // [!code highlight]
  readonly color = this.eyeDropper.sRGBHex;

  async pickColor() {
    await this.eyeDropper.open();
  }
}
```

## Parameters

| Parameter | Type                | Description                                            |
|-----------|---------------------|--------------------------------------------------------|
| `options` | `EyeDropperOptions` | Optional configuration (see [Options](#options) below) |

## Options

| Option         | Type                                                | Default | Description                            |
|----------------|-----------------------------------------------------|---------|----------------------------------------|
| `initialValue` | `string`                                            | `''`    | Initial color value in sRGB hex format |
| `injector`     | [`Injector`](https://angular.dev/api/core/Injector) | -       | Optional injector for DI context       |

## Return Value

The `eyeDropper()` function returns an `EyeDropperRef`:

| Property      | Type                  | Description                                |
|---------------|-----------------------|--------------------------------------------|
| `isSupported` | `Signal<boolean>`     | Whether EyeDropper API is supported        |
| `sRGBHex`     | `Signal<string>`      | Current selected color in sRGB hex format  |
| `open`        | `() => Promise<void>` | Open the eyedropper tool to select a color |
| `close`       | `() => void`          | Cancel the active eyedropper operation     |

## Examples

### Color picker

```angular-ts
import { Component } from '@angular/core';
import { eyeDropper } from '@signality/core';

@Component({
  template: `
    <div class="color-picker">
      <button (click)="pickColor()" [disabled]="!eyeDropper.isSupported()">
        Pick Color
      </button>

      @if (eyeDropper.sRGBHex()) {
        <div class="color-preview" [style.background-color]="eyeDropper.sRGBHex()">
          {{ eyeDropper.sRGBHex() }}
        </div>
      }
    </div>
  `,
})
export class ColorPicker {
  readonly eyeDropper = eyeDropper();

  async pickColor() {
    await this.eyeDropper.open();
  }
}
```

### Cancel picking

```angular-ts
import { Component } from '@angular/core';
import { eyeDropper } from '@signality/core';

@Component({
  template: `
    <button (click)="startPicking()">Start Picking</button>
    <button (click)="eyeDropper.close()">Cancel</button>
  `,
})
export class CancelablePicker {
  readonly eyeDropper = eyeDropper();

  async startPicking() {
    await this.eyeDropper.open(); // [!code highlight]
  }
}
```

## Browser Compatibility

The EyeDropper API has limited browser support. Always check `isSupported()` before using the color picker (see [Browser API support detection](/guide/key-concepts#browser-api-support-detection)):

```angular-html
@if (eyeDropper.isSupported()) {
  <button (click)="pickColor()">Pick Color</button>
} @else {
  <p>Color picker is not available in this browser</p>
}
```

For detailed browser support information, see [Can I use: EyeDropper API](https://caniuse.com/mdn-api_eyedropper).

## SSR Compatibility

On the server, signals initialize with safe defaults:

- `isSupported` → `false`
- `sRGBHex` → `''`
- `open` → no-op function
- `close` → no-op function

## Type Definitions

```typescript
interface EyeDropperOptions extends WithInjector {
  readonly initialValue?: string;
}

interface EyeDropperRef {
  readonly isSupported: Signal<boolean>;
  readonly sRGBHex: Signal<string>;
  readonly open: () => Promise<void>;
  readonly close: () => void;
}

function eyeDropper(options?: EyeDropperOptions): EyeDropperRef;
```

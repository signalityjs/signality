---
source: https://github.com/signalityjs/signality/blob/main/projects/core/browser/vibration/index.ts
---

# Vibration

Reactive wrapper around the [Vibration API](https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API). Trigger device vibration patterns with Angular signals.

<Demo name="vibration" />

## Usage

```angular-ts
import { Component } from '@angular/core';
import { vibration } from '@signality/core';

@Component({
  template: `
    <button (click)="vib.vibrate()">Vibrate</button>
    <button (click)="vib.stop()">Stop</button>
  `,
})
export class VibrationDemo {
  readonly vib = vibration({ pattern: 200 }); // [!code highlight]
}
```

## Parameters

| Parameter | Type               | Description                                            |
|-----------|--------------------|--------------------------------------------------------|
| `options` | `VibrationOptions` | Optional configuration (see [Options](#options) below) |

## Options

| Option     | Type                                                                                 | Description                               |
|------------|--------------------------------------------------------------------------------------|-------------------------------------------|
| `pattern`  | [`MaybeSignal<number \| number[]>`](/reference/utility-types#maybesignal-lt-type-gt) | Default vibration pattern in milliseconds |
| `injector` | [`Injector`](https://angular.dev/api/core/Injector)                                  | Optional injector for DI context          |

## Return Value

The `vibration()` function returns a `VibrationRef` object:

| Property      | Type                                     | Description                                                  |
|---------------|------------------------------------------|--------------------------------------------------------------|
| `isSupported` | `Signal<boolean>`                        | Whether Vibration API is supported                           |
| `isVibrating` | `Signal<boolean>`                        | Whether currently vibrating                                  |
| `vibrate`     | `(pattern?: number \| number[]) => void` | Start vibration (defaults to `200ms` if no pattern provided) |
| `stop`        | `() => void`                             | Stop vibration                                               |

## Examples

### Haptic feedback

```angular-ts
import { Component } from '@angular/core';
import { vibration } from '@signality/core';

@Component({
  template: `
    <button (click)="onTap()">Tap Me</button>
  `,
})
export class HapticButton {
  readonly vib = vibration();
  
  onTap() {
    this.vib.vibrate(50); // Short 50ms vibration // [!code highlight]
  }
}
```

## Vibration Patterns

The pattern can be passed at creation time or overridden when calling `vibrate()`:

```typescript
// Set default pattern at creation
const vib = vibration({ pattern: 200 });
vib.vibrate();

// Override pattern when calling vibrate()
vib.vibrate(100);
vib.vibrate([100, 50, 100]); // Pattern: vibrate, pause, vibrate
```

## Browser Compatibility

The Vibration API has limited browser support, primarily on mobile devices. Always check `isSupported()` before using vibration (see [Browser API support detection](/guide/key-concepts#browser-api-support-detection)):

```angular-html
@if (vib.isSupported()) {
  <button (click)="vib.vibrate()">Vibrate</button>
} @else {
  <p>Vibration is not available on this device</p>
}
```

For detailed browser support information, see [Can I use: Vibration API](https://caniuse.com/vibration).

## SSR Compatibility

On the server, signals initialize with safe defaults:

- `isSupported` → `false`
- `isVibrating` → `false`
- `vibrate`, `stop` → no-op functions

## Type Definitions

```typescript
interface VibrationOptions {
  readonly pattern?: MaybeSignal<number | number[]>;
  readonly injector?: Injector;
}

interface VibrationRef {
  readonly isSupported: Signal<boolean>;
  readonly isVibrating: Signal<boolean>;
  readonly vibrate: (pattern?: number | number[]) => void;
  readonly stop: () => void;
}

function vibration(options?: VibrationOptions): VibrationRef;
```

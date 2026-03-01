---
source: https://github.com/signalityjs/signality/blob/main/projects/core/browser/vibrate/index.ts
---

# Vibrate

Reactive wrapper around the [Vibration API](https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API). Trigger device vibration patterns with Angular signals.

<Demo name="vibrate" />

## Usage

```angular-ts
import { Component } from '@angular/core';
import { vibrate } from '@signality/core';

@Component({
  template: `
    <button (click)="vib.vibrate()">Vibrate</button>
    <button (click)="vib.stop()">Stop</button>
  `,
})
export class VibrateDemo {
  readonly vib = vibrate(); // [!code highlight]
}
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `pattern` | [`MaybeSignal<number \| number[]>`](/reference/utility-types#maybesignal-lt-type-gt) | Vibration pattern in milliseconds |
| `options` | `WithInjector` | Optional configuration (see [Options](#options) below) |

## Options

The `WithInjector` interface provides:

| Option     | Type      | Description                                    |
|------------|-----------|------------------------------------------------|
| `injector` | [`Injector`](https://angular.dev/api/core/Injector)| Optional injector for DI context               |

## Return Value

The `vibrate()` function returns a `VibrateRef` object:

| Property | Type | Description |
|----------|------|-------------|
| `isSupported` | `Signal<boolean>` | Whether Vibration API is supported |
| `isVibrating` | `Signal<boolean>` | Whether currently vibrating |
| `vibrate` | `(pattern?: number \| number[]) => void` | Start vibration (defaults to `200`ms if no pattern provided) |
| `stop` | `() => void` | Stop vibration |

## Examples

### Haptic feedback

```angular-ts
import { Component } from '@angular/core';
import { vibrate } from '@signality/core';

@Component({
  template: `
    <button (click)="onTap()">Tap Me</button>
  `,
})
export class HapticButton {
  readonly vib = vibrate();
  
  onTap() {
    this.vib.vibrate(50); // Short 50ms vibration // [!code highlight]
  }
}
```

### Notification patterns

```angular-ts
import { Component } from '@angular/core';
import { vibrate } from '@signality/core';

@Component({
  template: `
    <button (click)="success()">Success</button>
    <button (click)="error()">Error</button>
    <button (click)="warning()">Warning</button>
  `,
})
export class NotificationVibration {
  readonly vib = vibrate();
  
  success() {
    // Short double tap
    this.vib.vibrate([50, 50, 50]);
  }
  
  error() {
    // Long vibration
    this.vib.vibrate(500);
  }
  
  warning() {
    // Pattern: vibrate-pause-vibrate-pause-vibrate
    this.vib.vibrate([100, 100, 100, 100, 100]); // [!code highlight]
  }
}
```

### Game controller feedback

```angular-ts
import { Component, effect } from '@angular/core';
import { vibrate } from '@signality/core';

@Component({ /* ... */ })
export class GameFeedback {
  readonly vib = vibrate();
  
  onCollision(intensity: number) {
    // Vibration intensity based on collision force
    const duration = Math.min(intensity * 10, 500);
    this.vib.vibrate(duration);
  }
  
  onPowerUp() {
    // Celebratory pattern
    this.vib.vibrate([100, 50, 100, 50, 200]);
  }
  
  onGameOver() {
    // Dramatic long vibration
    this.vib.vibrate([200, 100, 200, 100, 500]);
  }
}
```

### Reactive pattern

```angular-ts
import { Component, signal, effect } from '@angular/core';
import { vibrate } from '@signality/core';

@Component({
  template: `
    <input 
      type="range" 
      min="0" 
      max="500" 
      [value]="duration()" 
      (input)="duration.set(+$any($event.target).value)" 
    />
    <p>Duration: {{ duration() }}ms</p>
  `,
})
export class ReactiveVibration {
  readonly duration = signal(100);
  readonly vib = vibrate(this.duration); // [!code highlight]
  
  constructor() {
    // Vibrate whenever duration changes
    effect(() => {
      const ms = this.duration();
      if (ms > 0) {
        this.vib.vibrate();
      }
    });
  }
}
```

## Vibration Patterns

The pattern is an array of milliseconds alternating between vibration and pause:

```typescript
// Single vibration for 200ms
vibrate(200);

// Pattern: 100ms vibrate, 50ms pause, 100ms vibrate
vibrate([100, 50, 100]);

// SOS pattern
vibrate([100, 50, 100, 50, 100, 200, 200, 50, 200, 50, 200, 200, 100, 50, 100, 50, 100]);
```

## Browser Compatibility

The Vibration API has limited browser support, primarily on mobile devices. Always check `isSupported()` before using vibration (see [Browser API support detection](/guide/key-concepts#browser-api-support-detection)):

```angular-html
@if (vibrate.isSupported()) {
  <button (click)="vibrate.vibrate(200)">Vibrate</button>
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
interface VibrateRef {
  readonly isSupported: Signal<boolean>;
  readonly isVibrating: Signal<boolean>;
  readonly vibrate: (pattern?: number | number[]) => void;
  readonly stop: () => void;
}

function vibrate(
  pattern?: MaybeSignal<number | number[]>,
  options?: WithInjector
): VibrateRef;
```

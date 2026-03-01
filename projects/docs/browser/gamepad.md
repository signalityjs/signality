---
source: https://github.com/signalityjs/signality/blob/main/projects/core/browser/gamepad/index.ts
---

# Gamepad

Reactive wrapper around the [Gamepad API](https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API). Track connected gamepads and their input state with Angular signals.

<Demo name="gamepad" />

## Usage

```angular-ts
import { Component } from '@angular/core';
import { gamepad } from '@signality/core';

@Component({
  template: `
    @if (gp.isSupported()) {
      @for (pad of gp.gamepads(); track pad?.index) {
        <p>{{ pad?.id }}</p>
      }
    }
  `,
})
export class GamepadDemo {
  readonly gp = gamepad(); // [!code highlight]
}
```

## Parameters

| Parameter | Type              | Description                                            |
|-----------|-------------------|--------------------------------------------------------|
| `options` | `WithInjector`    | Optional configuration (see [Options](#options) below) |

## Options

The `WithInjector` interface provides:

| Option     | Type       | Description                                    |
|------------|------------|------------------------------------------------|
| `injector` | [`Injector`](https://angular.dev/api/core/Injector) | Optional injector for DI context               |

## Return Value

The `gamepad()` function returns a `GamepadRef` object:

| Property | Type | Description |
|----------|------|-------------|
| `gamepads` | `Signal<(Gamepad \| null)[]>` | Array of connected gamepads |
| `isSupported` | `Signal<boolean>` | Whether Gamepad API is supported |
| `activeGamepad` | `Signal<Gamepad \| undefined>` | First connected gamepad (see [Gamepad](https://developer.mozilla.org/en-US/docs/Web/API/Gamepad)) |
| `axes` | `Signal<readonly number[]>` | Axes values of active gamepad |
| `buttons` | `Signal<readonly GamepadButton[]>` | Button states of active gamepad |

## Examples

### Movement controls

```angular-ts
import { Component, effect, signal } from '@angular/core';
import { gamepad } from '@signality/core';

@Component({
  template: `
    <div 
      class="player" 
      [style.left.px]="position().x" 
      [style.top.px]="position().y"
    ></div>
  `,
})
export class GameController {
  readonly gp = gamepad();
  readonly position = signal({ x: 100, y: 100 });
  
  constructor() {
    effect(() => {
      const axes = this.gp.axes();
      if (axes.length >= 2) {
        const [leftX, leftY] = axes;
        
        // Dead zone threshold
        const threshold = 0.1;
        const speed = 5;
        
        this.position.update(pos => ({
          x: pos.x + (Math.abs(leftX) > threshold ? leftX * speed : 0),
          y: pos.y + (Math.abs(leftY) > threshold ? leftY * speed : 0),
        }));
      }
    });
  }
}
```

### Button press detection

```angular-ts
import { Component, effect, signal } from '@angular/core';
import { gamepad } from '@signality/core';

@Component({
  template: `
    <p>A button: {{ aPressed() ? 'Pressed' : 'Released' }}</p>
    <p>B button: {{ bPressed() ? 'Pressed' : 'Released' }}</p>
  `,
})
export class ButtonDisplay {
  readonly gp = gamepad();
  readonly aPressed = signal(false);
  readonly bPressed = signal(false);
  
  constructor() {
    effect(() => {
      const buttons = this.gp.buttons();
      if (buttons.length > 0) {
        this.aPressed.set(buttons[0]?.pressed ?? false); // A button
        this.bPressed.set(buttons[1]?.pressed ?? false); // B button
      }
    });
  }
}
```

### Vibration feedback

```angular-ts
import { Component } from '@angular/core';
import { gamepad } from '@signality/core';

@Component({
  template: `
    <button (click)="vibrate()">Vibrate Controller</button>
  `,
})
export class VibrationDemo {
  readonly gp = gamepad();
  
  vibrate() {
    const pad = this.gp.activeGamepad();
    if (pad?.vibrationActuator) {
      pad.vibrationActuator.playEffect('dual-rumble', {
        startDelay: 0,
        duration: 200,
        weakMagnitude: 0.5,
        strongMagnitude: 1.0,
      });
    }
  }
}
```

## Browser Compatibility

The Gamepad API has limited browser support. Always check `isSupported()` before using gamepad functionality (see [Browser API support detection](/guide/key-concepts#browser-api-support-detection)):

```angular-html
@if (gamepad.isSupported()) {
  <p>Gamepads: {{ gamepad.gamepads().length }}</p>
} @else {
  <p>Gamepad support is not available in this browser</p>
}
```

For detailed browser support information, see [Can I use: Gamepad API](https://caniuse.com/gamepad).

## SSR Compatibility

On the server, signals initialize with safe defaults:

- `gamepads` → `[]`
- `isSupported` → `false`
- `activeGamepad` → `undefined`
- `axes` → `[]`
- `buttons` → `[]`

## Type Definitions

```typescript
interface GamepadRef {
  readonly gamepads: Signal<(Gamepad | null)[]>;
  readonly isSupported: Signal<boolean>;
  readonly activeGamepad: Signal<Gamepad | undefined>;
  readonly axes: Signal<readonly number[]>;
  readonly buttons: Signal<readonly GamepadButton[]>;
}

function gamepad(options?: WithInjector): GamepadRef;
```

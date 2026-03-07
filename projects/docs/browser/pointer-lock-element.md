---
source: https://github.com/signalityjs/signality/blob/main/projects/core/browser/pointer-lock-element/index.ts
---

# PointerLockElement

Reactive wrapper around the [Pointer Lock API](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_Lock_API). Returns a signal that tracks the element that currently has pointer lock.

## Usage

```angular-ts
import { Component, effect } from '@angular/core';
import { pointerLockElement } from '@signality/core';

@Component({
  template: `
    <div #gameArea (click)="requestLock()">
      <p>Locked: {{ lockedElement() ? 'Yes' : 'No' }}</p>
    </div>
  `,
})
export class GameDemo {
  readonly lockedElement = pointerLockElement(); // [!code highlight]
  
  requestLock() {
    const element = this.gameArea.nativeElement;
    element.requestPointerLock();
  }
  
  constructor() {
    effect(() => {
      if (this.lockedElement()) {
        console.log('Pointer locked on:', this.lockedElement());
      }
    });
  }
}
```

## Parameters

| Parameter | Type                      | Description                                            |
|-----------|---------------------------|--------------------------------------------------------|
| `options` | `PointerLockElementOptions`| Optional configuration (see [Options](#options) below) |

## Options

The `PointerLockElementOptions` extends Angular's [`CreateSignalOptions<Element | null>`](https://angular.dev/api/core/CreateSignalOptions) and `WithInjector`:

| Option      | Type                      | Description                                    |
|-------------|---------------------------|------------------------------------------------|
| `equal`     | [`ValueEqualityFn<Element \| null>`](https://angular.dev/api/core/ValueEqualityFn) | Custom equality function ([see more](https://angular.dev/guide/signals#signal-equality-functions)) |
| `debugName` | `string`                  | Debug name for the signal (development only)   |
| `injector`  | [`Injector`](https://angular.dev/api/core/Injector)                | Optional injector for DI context               |

## Return Value

Returns a `Signal<Element | null>` containing the element with pointer lock, or `null` if no element has lock.

## Examples

### First-person game

```angular-ts
import { Component, effect } from '@angular/core';
import { pointerLockElement } from '@signality/core';

@Component({
  template: `
    <canvas #canvas (click)="requestLock()"></canvas>
    @if (lockedElement()) {
      <p>Pointer locked - Move mouse to look around</p>
    }
  `,
})
export class FirstPersonGame {
  readonly lockedElement = pointerLockElement();
  
  requestLock() {
    this.canvas.nativeElement.requestPointerLock();
  }
  
  constructor() {
    effect(() => {
      if (this.lockedElement()) {
        // Start game loop
        this.startGameLoop();
      } else {
        // Stop game loop
        this.stopGameLoop();
      }
    });
  }
}
```

### Exit on Escape

```angular-ts
import { Component } from '@angular/core';
import { pointerLockElement } from '@signality/core';

@Component({
  template: `
    <div #target (click)="lock()">Click to lock pointer</div>
  `,
})
export class LockDemo {
  readonly lockedElement = pointerLockElement();
  
  lock() {
    this.target.nativeElement.requestPointerLock();
  }
  
  @HostListener('document:keydown.escape')
  unlock() {
    document.exitPointerLock();
  }
}
```

## SSR Compatibility

On the server, the signal initializes with `null`.

## Type Definitions

```typescript
type PointerLockElementOptions = CreateSignalOptions<Element | null> & WithInjector;

function pointerLockElement(options?: PointerLockElementOptions): Signal<Element | null>;
```

## Related

- [MousePosition](/elements/mouse-position) — Mouse position tracking
- [ElementFocus](/elements/element-focus) — Element focus tracking


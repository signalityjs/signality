---
source: https://github.com/signalityjs/signality/blob/main/projects/core/browser/fullscreen/index.ts
---

# Fullscreen

Reactive wrapper around the [Fullscreen API](https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API). Control fullscreen mode for any element with Angular signals.

<Demo name="fullscreen" />

## Usage

```angular-ts
import { Component } from '@angular/core';
import { fullscreen } from '@signality/core';

@Component({
  template: `
    <button (click)="fs.toggle()">Toggle Fullscreen</button>
    <div>Active: {{ fs.isActive() }}</div>
  `,
})
export class FullscreenDemo {
  readonly fs = fullscreen(); // [!code highlight]
}
```

## Parameters

| Parameter | Type                | Description                                            |
|-----------|---------------------|--------------------------------------------------------|
| `options` | `FullscreenOptions` | Optional configuration (see [Options](#options) below) |

## Options

| Option     | Type                                                | Default                    | Description                      |
|------------|-----------------------------------------------------|----------------------------|----------------------------------|
| `target`   | `MaybeElementSignal<Element>`                       | `document.documentElement` | Element to make fullscreen       |
| `injector` | [`Injector`](https://angular.dev/api/core/Injector) | -                          | Optional injector for DI context |

## Return Value

| Property      | Type                  | Description                             |
|---------------|-----------------------|-----------------------------------------|
| `isSupported` | `Signal<boolean>`     | Whether the Fullscreen API is supported |
| `isActive`    | `Signal<boolean>`     | Whether the target is in fullscreen     |
| `enter`       | `() => Promise<void>` | Enter fullscreen mode                   |
| `exit`        | `() => Promise<void>` | Exit fullscreen mode                    |
| `toggle`      | `() => Promise<void>` | Toggle fullscreen mode                  |

## Examples

### Fullscreen a specific element

```angular-ts
import { Component, viewChild, ElementRef } from '@angular/core';
import { fullscreen } from '@signality/core';

@Component({
  template: `
    <div #container class="fullscreen-container">
      <p>This content can go fullscreen</p>
      <button (click)="fs.toggle()">
        {{ fs.isActive() ? 'Exit' : 'Enter' }} Fullscreen
      </button>
    </div>
  `,
})
export class ElementFullscreen {
  readonly container = viewChild<ElementRef>('container');
  readonly fs = fullscreen({ target: this.container }); // [!code highlight]
}
```

## Browser Compatibility

The Fullscreen API has broad browser support. Always check `isSupported()` before using fullscreen (see [Browser API support detection](/guide/key-concepts#browser-api-support-detection)):

```angular-html
@if (fs.isSupported()) {
  <button (click)="fs.enter()">Enter Fullscreen</button>
} @else {
  <p>Fullscreen is not available in this browser</p>
}
```

For detailed browser support information, see [Can I use: Fullscreen API](https://caniuse.com/fullscreen).

## SSR Compatibility

On the server, signals initialize with safe defaults:

- `isSupported` → `false`
- `isActive` → `false`
- `enter`, `exit`, `toggle` → no-op functions

## Type Definitions

```typescript
interface FullscreenOptions extends WithInjector {
  readonly target?: MaybeElementSignal<Element>;
}

interface FullscreenRef {
  readonly isSupported: Signal<boolean>;
  readonly isActive: Signal<boolean>;
  readonly enter: () => Promise<void>;
  readonly exit: () => Promise<void>;
  readonly toggle: () => Promise<void>;
}

function fullscreen(options?: FullscreenOptions): FullscreenRef;
```

## Related

- [PictureInPicture](/browser/picture-in-picture) — Float video elements in a separate window

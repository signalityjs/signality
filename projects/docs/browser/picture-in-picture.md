---
source: https://github.com/signalityjs/signality/blob/main/projects/core/browser/picture-in-picture/index.ts
---

# PictureInPicture

Reactive wrapper around the [Picture-in-Picture API](https://developer.mozilla.org/en-US/docs/Web/API/Picture-in-Picture_API). Control Picture-in-Picture mode for video elements with Angular signals.

<Demo name="picture-in-picture" />

## Usage

```angular-ts
import { Component, viewChild } from '@angular/core';
import { pictureInPicture } from '@signality/core';

@Component({
  template: `
    <video #video src="video.mp4"></video>
    @if (pip.isSupported()) {
      <button (click)="pip.toggle()">Toggle PiP</button>
      <div>Active: {{ pip.isActive() }}</div>
    }
  `,
})
export class PiPDemo {
  readonly video = viewChild<HTMLVideoElement>('video');
  readonly pip = pictureInPicture(this.video); // [!code highlight]
}
```

## Parameters

| Parameter | Type                                   | Description                                            |
|-----------|----------------------------------------|--------------------------------------------------------|
| `target`  | `MaybeElementSignal<HTMLVideoElement>` | Video element                                          |
| `options` | `PictureInPictureOptions`              | Optional configuration (see [Options](#options) below) |

## Options

| Option     | Type                                                | Default | Description                      |
|------------|-----------------------------------------------------|---------|----------------------------------|
| `injector` | [`Injector`](https://angular.dev/api/core/Injector) | -       | Optional injector for DI context |

## Return Value

| Property      | Type                  | Description                                 |
|---------------|-----------------------|---------------------------------------------|
| `isSupported` | `Signal<boolean>`     | Whether Picture-in-Picture API is supported |
| `isActive`    | `Signal<boolean>`     | Whether Picture-in-Picture is active        |
| `enter`       | `() => Promise<void>` | Enter Picture-in-Picture mode               |
| `exit`        | `() => Promise<void>` | Exit Picture-in-Picture mode                |
| `toggle`      | `() => Promise<void>` | Toggle Picture-in-Picture mode              |

## Browser Compatibility

The Picture-in-Picture API has limited browser support. Always check `isSupported()` before using Picture-in-Picture (see [Browser API support detection](/guide/key-concepts#browser-api-support-detection)):

```angular-html
@if (pip.isSupported()) {
  <button (click)="pip.enter()">Enter PiP</button>
} @else {
  <p>Picture-in-Picture is not available in this browser</p>
}
```

For detailed browser support information, see [Can I use: Picture-in-Picture API](https://caniuse.com/picture-in-picture).

## SSR Compatibility

On the server, signals initialize with safe defaults:

- `isSupported` → `false`
- `isActive` → `false`
- `enter`, `exit`, `toggle` → no-op functions

## Type Definitions

```typescript
type PictureInPictureOptions = WithInjector;

interface PictureInPictureRef {
  readonly isSupported: Signal<boolean>;
  readonly isActive: Signal<boolean>;
  readonly enter: () => Promise<void>;
  readonly exit: () => Promise<void>;
  readonly toggle: () => Promise<void>;
}

function pictureInPicture(
  target: MaybeElementSignal<HTMLVideoElement>,
  options?: PictureInPictureOptions
): PictureInPictureRef;
```

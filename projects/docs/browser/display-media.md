---
source: https://github.com/signalityjs/signality/blob/main/projects/core/browser/display-media/index.ts
---

# DisplayMedia

Reactive wrapper around the [Screen Capture API](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Capture_API). Capture screen content with Angular signals.

::: warning Secure Context Required
This feature is available only in [secure contexts](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Secure_Contexts) (HTTPS) or potentially trustworthy origins (such as `localhost` or `127.0.0.1`). Regular `http://` URLs will not work in most browsers.
:::

<Demo name="display-media" />

## Usage

```angular-ts
import { Component } from '@angular/core';
import { displayMedia } from '@signality/core';

@Component({
  template: `
    @if (dm.isSupported()) {
      <button (click)="dm.start()" [disabled]="dm.stream()">
        Start Capture
      </button>
      <button (click)="dm.stop()" [disabled]="!dm.stream()">
        Stop Capture
      </button>
      <video [srcObject]="dm.stream()" autoplay></video>
    }
  `,
})
export class ScreenCaptureDemo {
  readonly dm = displayMedia(); // [!code highlight]
}
```

## Parameters

| Parameter | Type                  | Description                                            |
|-----------|-----------------------|--------------------------------------------------------|
| `options` | `DisplayMediaOptions` | Optional configuration (see [Options](#options) below) |

## Options

| Option     | Type                                                | Default | Description                      |
|------------|-----------------------------------------------------|---------|----------------------------------|
| `video`    | `boolean \| MediaTrackConstraints`                  | `true`  | Video constraints                |
| `audio`    | `boolean \| MediaTrackConstraints`                  | `false` | Audio constraints                |
| `injector` | [`Injector`](https://angular.dev/api/core/Injector) | -       | Optional injector for DI context |

## Return Value

| Property      | Type                                         | Description                             |
|---------------|----------------------------------------------|-----------------------------------------|
| `isSupported` | `Signal<boolean>`                            | Whether Screen Capture API is supported |
| `isActive`    | `Signal<boolean>`                            | Whether currently capturing             |
| `stream`      | `Signal<MediaStream \| null>`                | Current media stream                    |
| `error`       | `Signal<Error \| null>`                      | Last error occurred                     |
| `start`       | `() => Promise<MediaStream \| null>`         | Start screen capture                    |
| `stop`        | `() => void`                                 | Stop screen capture                     |

## Browser Compatibility

The Screen Capture API has limited browser support. Always check `isSupported()` before using screen capture (see [Browser API support detection](/guide/key-concepts#browser-api-support-detection)):

```angular-html
@if (screen.isSupported()) {
  <button (click)="screen.start()">Start Screen Share</button>
} @else {
  <p>Screen capture is not available in this browser</p>
}
```

For detailed browser support information, see [Can I use: Screen Capture API](https://caniuse.com/mdn-api_mediadevices_getdisplaymedia).

## SSR Compatibility

On the server, signals initialize with safe defaults:

- `isSupported` → `false`
- `isActive` → `false`
- `stream` → `null`
- `error` → `null`
- `start`, `stop` → no-op functions

## Type Definitions

```typescript
interface DisplayMediaOptions extends WithInjector {
  readonly video?: boolean | MediaTrackConstraints;
  readonly audio?: boolean | MediaTrackConstraints;
}

interface DisplayMediaRef {
  readonly isSupported: Signal<boolean>;
  readonly isActive: Signal<boolean>;
  readonly stream: Signal<MediaStream | null>;
  readonly error: Signal<Error | null>;
  readonly start: () => Promise<MediaStream | null>;
  readonly stop: () => void;
}

function displayMedia(options?: DisplayMediaOptions): DisplayMediaRef;
```


---
source: https://github.com/signalityjs/signality/blob/main/projects/core/browser/device-posture/index.ts
---

# DevicePosture

Reactive wrapper around the [Device Posture API](https://developer.mozilla.org/en-US/docs/Web/API/Device_Posture_API). Track device posture state for foldable devices with Angular signals.

## Usage

```angular-ts
import { Component } from '@angular/core';
import { devicePosture } from '@signality/core';

@Component({
  template: `
    <p>Posture: {{ posture.type() }}</p>
  `,
})
export class PostureDemo {
  readonly posture = devicePosture(); // [!code highlight]
}
```

## Parameters

| Parameter | Type           | Description                                            |
|-----------|----------------|--------------------------------------------------------|
| `options` | `WithInjector` | Optional configuration (see [Options](#options) below) |

## Options

The `WithInjector` interface provides:

| Option     | Type                                                | Description                      |
|------------|-----------------------------------------------------|----------------------------------|
| `injector` | [`Injector`](https://angular.dev/api/core/Injector) | Optional injector for DI context |

## Return Value

The `devicePosture()` function returns a `DevicePostureRef` object:

| Property      | Type                        | Description                                           |
|---------------|-----------------------------|-------------------------------------------------------|
| `isSupported` | `Signal<boolean>`           | Whether Device Posture API is supported               |
| `type`        | `Signal<DevicePostureType>` | Current device posture (`'continuous'` or `'folded'`) |

## Examples

### Adaptive layout for foldable devices

```angular-ts
import { Component, computed } from '@angular/core';
import { devicePosture } from '@signality/core';

@Component({
  template: `
    <div [class]="posture.type()">
      <div class="panel">Content</div>
    </div>
  `,
})
export class AdaptiveLayout {
  readonly posture = devicePosture();
}
```

## Browser Compatibility

The Device Posture API has limited browser support. Always check `isSupported()` before relying on posture data (see [Browser API support detection](/guide/key-concepts#browser-api-support-detection)):

```angular-html
@if (posture.isSupported()) {
  <p>Posture: {{ posture.type() }}</p>
} @else {
  <p>Device Posture API is not supported in this browser</p>
}
```

For detailed browser support information, see [Can I use: Device Posture API](https://caniuse.com/device-posture-api).

## SSR Compatibility

On the server, signals initialize with safe defaults:

- `isSupported` → `false`
- `type` → `'continuous'`

## Type Definitions

```typescript
type DevicePostureType = 'continuous' | 'folded';

interface DevicePostureRef {
  readonly isSupported: Signal<boolean>;
  readonly type: Signal<DevicePostureType>;
}

function devicePosture(options?: WithInjector): DevicePostureRef;
```

## Related

- [WindowSize](/elements/window-size) — Window dimensions tracking
- [ScreenOrientation](/browser/screen-orientation) — Screen orientation tracking

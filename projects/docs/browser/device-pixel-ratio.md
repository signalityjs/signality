---
source: https://github.com/signalityjs/signality/blob/main/projects/core/browser/device-pixel-ratio/index.ts
---

# DevicePixelRatio

Reactive wrapper around [window.devicePixelRatio](https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio). Track device pixel ratio changes (zoom level or display density) with Angular signals.

<Demo name="device-pixel-ratio" />

## Usage

```angular-ts
import { Component } from '@angular/core';
import { devicePixelRatio } from '@signality/core';

@Component({
  template: `
    <p>Pixel Ratio: {{ pixelRatio() }}</p>
  `,
})
export class PixelRatioDemo {
  readonly pixelRatio = devicePixelRatio(); // [!code highlight]
}
```

::: warning Use InjectionToken for Singleton
For global state tracking like `devicePixelRatio`, consider using the provided `DEVICE_PIXEL_RATIO` token instead of calling the function directly. This provides a singleton instance that can be shared across your entire application, reducing memory usage and event listener overhead:

```typescript
import { inject } from '@angular/core';
import { DEVICE_PIXEL_RATIO } from '@signality/core';

const pixelRatio = devicePixelRatio(); // [!code --]
const pixelRatio = inject(DEVICE_PIXEL_RATIO); // [!code ++]
```

Learn more about [Token-based utilities](/guide/key-concepts#token-based-utilities).
:::

## Parameters

| Parameter | Type                      | Description                                            |
|-----------|---------------------------|--------------------------------------------------------|
| `options` | `DevicePixelRatioOptions` | Optional configuration (see [Options](#options) below) |

## Options

The `DevicePixelRatioOptions` extends Angular's [`CreateSignalOptions<number>`](https://angular.dev/api/core/CreateSignalOptions) and `WithInjector`:

| Option         | Type                                                                      | Description                                                                                        |
|----------------|---------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------|
| `initialValue` | `number`                                                                  | Initial value for SSR (default: `1`)                                                               |
| `equal`        | [`ValueEqualityFn<number>`](https://angular.dev/api/core/ValueEqualityFn) | Custom equality function ([see more](https://angular.dev/guide/signals#signal-equality-functions)) |
| `debugName`    | `string`                                                                  | Debug name for the signal (development only)                                                       |
| `injector`     | [`Injector`](https://angular.dev/api/core/Injector)                       | Optional injector for DI context                                                                   |

## Return Value

Returns a `Signal<number>` containing the current device pixel ratio value.

## Examples

### Adaptive image loading

```angular-ts
import { Component, computed } from '@angular/core';
import { devicePixelRatio } from '@signality/core';

@Component({
  template: `
    <img [src]="imageSrc()" alt="Responsive image" />
  `,
})
export class AdaptiveImage {
  readonly pixelRatio = devicePixelRatio();

  readonly imageSrc = computed(() => {
    const ratio = this.pixelRatio();
    if (ratio >= 2) return '/images/logo@2x.png';
    if (ratio >= 1.5) return '/images/logo@1.5x.png';
    return '/images/logo.png';
  });
}
```

## SSR Compatibility

On the server, the signal initializes with `1` (default pixel ratio). You can provide a custom initial value:

```typescript
const pixelRatio = devicePixelRatio({
  initialValue: 2
});
```

## Type Definitions

```typescript
type DevicePixelRatioOptions = CreateSignalOptions<number> & WithInjector;

function devicePixelRatio(options?: DevicePixelRatioOptions): Signal<number>;

const DEVICE_PIXEL_RATIO: InjectionToken<Signal<number>>;
```

## Related

- [MediaQuery](/browser/media-query) — General media query matching
- [WindowSize](/browser/window-size) — Window dimensions tracking
- [ScreenOrientation](/browser/screen-orientation) — Screen orientation tracking

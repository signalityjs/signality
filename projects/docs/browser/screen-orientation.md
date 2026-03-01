---
source: https://github.com/signalityjs/signality/blob/main/projects/core/browser/screen-orientation/index.ts
---

# ScreenOrientation

Reactive wrapper around the [Screen Orientation API](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Orientation_API). Returns a signal that tracks the current screen orientation.

<Demo name="screen-orientation" />

## Usage

```angular-ts
import { Component, effect } from '@angular/core';
import { screenOrientation } from '@signality/core';

@Component({
  template: `
    <p>Orientation: {{ orientation() }}</p>
  `,
})
export class OrientationDemo {
  readonly orientation = screenOrientation(); // [!code highlight]
  
  constructor() {
    effect(() => {
      if (this.orientation() === 'landscape-primary') {
        console.log('Device is in landscape mode');
      }
    });
  }
}
```

## Parameters

| Parameter | Type                      | Description                                            |
|-----------|---------------------------|--------------------------------------------------------|
| `options` | `ScreenOrientationOptions`| Optional configuration (see [Options](#options) below) |

## Options

The `ScreenOrientationOptions` extends Angular's [`CreateSignalOptions<OrientationType>`](https://angular.dev/api/core/CreateSignalOptions) and `WithInjector`, where [`OrientationType`](https://developer.mozilla.org/en-US/docs/Web/API/ScreenOrientation/type) is the Web API type:

| Option        | Type                      | Default            | Description                                    |
|---------------|---------------------------|--------------------|------------------------------------------------|
| `initialValue`| [`OrientationType`](https://developer.mozilla.org/en-US/docs/Web/API/ScreenOrientation/type)         | `'portrait-primary'`| Initial orientation value for SSR              |
| `equal`       | [`ValueEqualityFn<OrientationType>`](https://angular.dev/api/core/ValueEqualityFn) | -                  | Custom equality function ([see more](https://angular.dev/guide/signals#signal-equality-functions)) |
| `debugName`   | `string`                  | -                  | Debug name for the signal (development only)   |
| `injector`    | [`Injector`](https://angular.dev/api/core/Injector)                | -                  | Optional injector for DI context               |

## Return Value

Returns a `Signal<OrientationType>` containing the current screen orientation, where [`OrientationType`](https://developer.mozilla.org/en-US/docs/Web/API/ScreenOrientation/type) is the Web API type. Possible values:
- `'portrait-primary'` - Device is in primary portrait orientation
- `'portrait-secondary'` - Device is in secondary portrait orientation (rotated 180°)
- `'landscape-primary'` - Device is in primary landscape orientation
- `'landscape-secondary'` - Device is in secondary landscape orientation (rotated 180°)

## Examples

### Adaptive layout

```angular-ts
import { Component, computed } from '@angular/core';
import { screenOrientation } from '@signality/core';

@Component({
  template: `
    <div [class]="layoutClass()">
      <div class="content">Content</div>
    </div>
  `,
  styles: `
    .portrait {
      display: flex;
      flex-direction: column;
    }
    
    .landscape {
      display: grid;
      grid-template-columns: 1fr 1fr;
    }
  `,
})
export class AdaptiveLayout {
  readonly orientation = screenOrientation();
  
  readonly layoutClass = computed(() => {
    const orient = this.orientation();
    return orient.startsWith('portrait') ? 'portrait' : 'landscape';
  });
}
```

## SSR Compatibility

On the server, the signal initializes with the value from `initialValue` option (defaults to `'portrait-primary'`). You can provide a custom initial value for SSR:

```typescript
const orientation = screenOrientation({
  initialValue: 'landscape-primary'
});
```

## Type Definitions

```typescript
interface ScreenOrientationOptions extends CreateSignalOptions<OrientationType>, WithInjector {
  readonly initialValue?: OrientationType;
}

function screenOrientation(options?: ScreenOrientationOptions): Signal<OrientationType>;
```

## Related

- [WindowSize](/elements/window-size) — Window dimensions tracking
- [DevicePosture](/browser/device-posture) — Device posture for foldable devices

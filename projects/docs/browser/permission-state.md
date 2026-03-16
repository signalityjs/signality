---
source: https://github.com/signalityjs/signality/blob/main/projects/core/browser/permission-state/index.ts
---

# PermissionState

Reactive wrapper around the [Permissions API](https://developer.mozilla.org/en-US/docs/Web/API/Permissions_API). Queries the permission state for a given name and returns a signal that reactively tracks changes.

<Demo name="permission-state" />

## Usage

```angular-ts
import { Component } from '@angular/core';
import { permissionState } from '@signality/core';

@Component({
  template: `
    <p>Camera permission: {{ cameraPermission() }}</p>
  `,
})
export class PermissionDemo {
  readonly cameraPermission = permissionState('camera'); // [!code highlight]
}
```

## Parameters

| Parameter | Type                    | Description                                              |
|-----------|-------------------------|----------------------------------------------------------|
| `name`    | `PermissionName`        | The permission name to query (e.g. `'camera'`, `'geolocation'`, `'notifications'`) |
| `options` | `PermissionStateOptions` | Optional configuration (see [Options](#options) below)   |

## Options

The `PermissionStateOptions` extends Angular's [`CreateSignalOptions<PermissionState>`](https://angular.dev/api/core/CreateSignalOptions) and `WithInjector`:

| Option      | Type                      | Description                                    |
|-------------|---------------------------|------------------------------------------------|
| `equal`     | [`ValueEqualityFn<PermissionState>`](https://angular.dev/api/core/ValueEqualityFn) | Custom equality function ([see more](https://angular.dev/guide/signals#signal-equality-functions)) |
| `debugName` | `string`                  | Debug name for the signal (development only)   |
| `injector`  | [`Injector`](https://angular.dev/api/core/Injector)                | Optional injector for DI context               |

## Return Value

Returns a `Signal<PermissionState>` containing the current permission state:
- `'granted'` — The permission has been granted
- `'denied'` — The permission has been denied
- `'prompt'` — The user has not yet been asked (also used as default for SSR and unsupported browsers)

## Examples

### React to permission changes

```angular-ts
import { Component, effect } from '@angular/core';
import { permissionState, geolocation } from '@signality/core';

@Component({
  template: `
    <p>Geolocation permission: {{ geoPermission() }}</p>
  `,
})
export class GeoPermissionTracker {
  readonly geoPermission = permissionState('geolocation');
  readonly geo = geolocation({ immediate: false });

  constructor() {
    effect(() => {
      if (this.geoPermission() === 'granted') {
        this.geo.start();
      }
    });
  }
}
```

## Browser Compatibility

Not all browsers support querying all permission names. If the browser does not support querying a specific permission, the signal will remain at `'prompt'`. See [Permissions API browser compatibility on MDN](https://developer.mozilla.org/en-US/docs/Web/API/Permissions_API#browser_compatibility) for details.

## SSR Compatibility

On the server, the signal initializes with `'prompt'`.

## Type Definitions

```typescript
type PermissionStateOptions = CreateSignalOptions<PermissionState> & WithInjector;

function permissionState(
  name: PermissionName,
  options?: PermissionStateOptions,
): Signal<PermissionState>;
```

## Related

- [Geolocation](/browser/geolocation) — Tracks device position (uses geolocation permission internally)
- [WebNotification](/browser/web-notification) — Web Notifications API wrapper

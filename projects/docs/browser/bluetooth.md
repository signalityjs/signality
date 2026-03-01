---
source: https://github.com/signalityjs/signality/blob/main/projects/core/browser/bluetooth/index.ts
---

# Bluetooth

Reactive wrapper around the [Web Bluetooth API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API). Connect to Bluetooth devices and track connection state with Angular signals.

::: warning Secure Context Required
This feature is available only in [secure contexts](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Secure_Contexts) (HTTPS) or potentially trustworthy origins (such as `localhost` or `127.0.0.1`). Regular `http://` URLs will not work in most browsers.
:::

<Demo name="bluetooth" />

## Usage

```angular-ts
import { Component } from '@angular/core';
import { bluetooth } from '@signality/core';

@Component({
  template: `
    @if (bt.isSupported()) {
      <button (click)="bt.request()" [disabled]="bt.isConnecting()">
        {{ bt.isConnected() ? 'Connected' : 'Connect Device' }}
      </button>
      
      @if (bt.device()) {
        <p>Device: {{ bt.device()?.name }}</p>
      }
    } @else {
      <p>Bluetooth not supported</p>
    }
  `,
})
export class BluetoothDemo {
  readonly bt = bluetooth(); // [!code highlight]
}
```

## Parameters

| Parameter | Type               | Description                                            |
|-----------|--------------------|--------------------------------------------------------|
| `options` | `BluetoothOptions` | Optional configuration (see [Options](#options) below) |

## Options

| Option             | Type                                                | Description                      |
|--------------------|-----------------------------------------------------|----------------------------------|
| `acceptAllDevices` | `boolean`                                           | Accept any Bluetooth device      |
| `filters`          | `BluetoothLEScanFilter[]`                           | Filters for device selection     |
| `optionalServices` | `BluetoothServiceUUID[]`                            | Optional services to access      |
| `injector`         | [`Injector`](https://angular.dev/api/core/Injector) | Optional injector for DI context |

## Return Value

The `bluetooth()` function returns a `BluetoothRef` object:

| Property       | Type                                        | Description                             |
|----------------|---------------------------------------------|-----------------------------------------|
| `isSupported`  | `Signal<boolean>`                           | Whether Web Bluetooth API is supported  |
| `isConnected`  | `Signal<boolean>`                           | Whether a device is currently connected |
| `isConnecting` | `Signal<boolean>`                           | Whether connection is in progress       |
| `device`       | `Signal<BluetoothDevice \| null>`           | Connected Bluetooth device              |
| `server`       | `Signal<BluetoothRemoteGATTServer \| null>` | GATT server of connected device         |
| `error`        | `Signal<Error \| null>`                     | Last error that occurred                |
| `request`      | `(options?) => Promise<void>`               | Request device connection               |
| `disconnect`   | `() => void`                                | Disconnect from device                  |

## Examples

### Connection status

```angular-ts
import { Component, computed } from '@angular/core';
import { bluetooth } from '@signality/core';

@Component({
  template: `
    <div [class]="statusClass()">
      {{ statusText() }}
    </div>
  `,
})
export class BluetoothStatus {
  readonly bt = bluetooth();
  
  readonly statusClass = computed(() => {
    if (this.bt.isConnecting()) return 'connecting';
    if (this.bt.isConnected()) return 'connected';
    return 'disconnected';
  });
  
  readonly statusText = computed(() => {
    if (this.bt.isConnecting()) return 'Connecting...';
    if (this.bt.isConnected()) return `Connected to ${this.bt.device()?.name}`;
    return 'Not connected';
  });
}
```

## Browser Compatibility

The Web Bluetooth API has limited browser support. Always check `isSupported()` before relying on Bluetooth functionality (see [Browser API support detection](/guide/key-concepts#browser-api-support-detection)):

```angular-html
@if (bluetooth.isSupported()) {
  <button (click)="bluetooth.request()">Connect Device</button>
} @else {
  <p>Bluetooth is not available in this browser</p>
}
```

For detailed browser support information, see [Can I use: Web Bluetooth API](https://caniuse.com/web-bluetooth).

## SSR Compatibility

On the server, signals initialize with safe defaults:

- `isSupported` → `false`
- `isConnected` → `false`
- `isConnecting` → `false`
- `device`, `server`, `error` → `null`
- `request`, `disconnect` → no-op functions

## Type Definitions

```typescript
interface BluetoothOptions extends WithInjector {
  readonly acceptAllDevices?: boolean;
  readonly filters?: BluetoothLEScanFilter[];
  readonly optionalServices?: BluetoothServiceUUID[];
}

interface BluetoothRef {
  readonly isSupported: Signal<boolean>;
  readonly isConnected: Signal<boolean>;
  readonly isConnecting: Signal<boolean>;
  readonly device: Signal<BluetoothDevice | null>;
  readonly server: Signal<BluetoothRemoteGATTServer | null>;
  readonly error: Signal<Error | null>;
  readonly request: (options?: RequestDeviceOptions) => Promise<void>;
  readonly disconnect: () => void;
}

function bluetooth(options?: BluetoothOptions): BluetoothRef;
```

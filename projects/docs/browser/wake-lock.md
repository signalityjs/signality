---
source: https://github.com/signalityjs/signality/blob/main/projects/core/browser/wake-lock/index.ts
---

# WakeLock

Reactive wrapper around the [Screen Wake Lock API](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API). Prevent devices from dimming or locking the screen with Angular signals.

::: warning Secure Context Required
This feature is available only in [secure contexts](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Secure_Contexts) (HTTPS) or potentially trustworthy origins (such as `localhost` or `127.0.0.1`). Regular `http://` URLs will not work in most browsers.
:::

<Demo name="wake-lock" />

## Usage

```angular-ts
import { Component } from '@angular/core';
import { wakeLock } from '@signality/core';

@Component({
  template: `
    <button (click)="toggleWakeLock()" [disabled]="!wakeLock.isSupported()">
      {{ wakeLock.isActive() ? 'Release' : 'Request' }} Wake Lock
    </button>
    <p>Status: {{ wakeLock.isActive() ? 'Active' : 'Inactive' }}</p>
  `,
})
export class WakeLockDemo {
  readonly wakeLock = wakeLock(); // [!code highlight]

  async toggleWakeLock() {
    if (this.wakeLock.isActive()) {
      await this.wakeLock.release();
    } else {
      await this.wakeLock.request();
    }
  }
}
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `options` | `WakeLockOptions` | Optional configuration (see [Options](#options) below) |

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `autoReacquire` | `boolean` | `true` | Whether to automatically reacquire wake lock when document becomes visible |
| `injector` | [`Injector`](https://angular.dev/api/core/Injector) | - | Optional injector for DI context |

## Examples

### Presentation mode

```angular-ts
import { Component, effect } from '@angular/core';
import { wakeLock } from '@signality/core';

@Component({
  template: `
    <div [class.presenting]="isPresenting()">
      <button (click)="startPresentation()">Start Presentation</button>
      <button (click)="stopPresentation()">Stop Presentation</button>
    </div>
  `,
})
export class PresentationMode {
  readonly wakeLock = wakeLock();
  readonly isPresenting = signal(false);

  async startPresentation() {
    await this.wakeLock.request();
    this.isPresenting.set(true);
  }

  async stopPresentation() {
    await this.wakeLock.release();
    this.isPresenting.set(false);
  }
}
```

### QR code scanner

```angular-ts
import { Component } from '@angular/core';
import { wakeLock } from '@signality/core';

@Component({
  template: `
    @if (showQRCode()) {
      <div class="qr-code">
        <img [src]="qrCodeUrl" />
      </div>
    }
  `,
})
export class QRCodeScanner {
  readonly wakeLock = wakeLock();
  readonly showQRCode = signal(false);

  async displayQRCode() {
    this.showQRCode.set(true);
    // Keep screen awake while QR code is displayed
    await this.wakeLock.request(); // [!code highlight]
  }

  async hideQRCode() {
    this.showQRCode.set(false);
    await this.wakeLock.release();
  }
}
```

### Auto reacquire

```angular-ts
import { Component } from '@angular/core';
import { wakeLock } from '@signality/core';

@Component({
  template: `
    <button (click)="wakeLock.request()">Request Wake Lock</button>
  `,
})
export class AutoReacquire {
  // Automatically reacquires wake lock when document becomes visible again
  readonly wakeLock = wakeLock({ autoReacquire: true }); // [!code highlight]
}
```

## Browser Compatibility

The Screen Wake Lock API has limited browser support. Always check `isSupported()` before requesting a wake lock (see [Browser API support detection](/guide/key-concepts#browser-api-support-detection)):

```angular-html
@if (wakeLock.isSupported()) {
  <button (click)="wakeLock.request()">Keep Screen On</button>
} @else {
  <p>Wake lock is not available in this browser</p>
}
```

For detailed browser support information, see [Can I use: Screen Wake Lock API](https://caniuse.com/wake-lock).

## SSR Compatibility

On the server, signals initialize with safe defaults:

- `isSupported` → `false`
- `isActive` → `false`
- `sentinel` → `null`
- `request`, `forceRequest`, `release` → no-op functions

## Type Definitions

```typescript
interface WakeLockOptions extends WithInjector {
  readonly autoReacquire?: boolean;
}

interface WakeLockRef {
  readonly isSupported: Signal<boolean>;
  readonly isActive: Signal<boolean>;
  readonly sentinel: Signal<WakeLockSentinel | null>;
  readonly request: () => Promise<void>;
  readonly forceRequest: () => Promise<void>;
  readonly release: () => Promise<void>;
}

function wakeLock(options?: WakeLockOptions): WakeLockRef;
```


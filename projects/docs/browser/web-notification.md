---
source: https://github.com/signalityjs/signality/blob/main/projects/core/browser/web-notification/index.ts
---

# WebNotification

Reactive wrapper around the [Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API). Show browser notifications with Angular signals.

::: warning Secure Context Required
This feature is available only in [secure contexts](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Secure_Contexts) (HTTPS) or potentially trustworthy origins (such as `localhost` or `127.0.0.1`). Regular `http://` URLs will not work in most browsers.
:::

<Demo name="web-notification" />

## Usage

On supported platforms, showing a system notification requires the user to grant permission via `requestPermission()`. This method must be called during a user gesture (e.g., click). Permission states: `default` (not requested), `granted`, or `denied`.

```angular-ts
import { Component } from '@angular/core';
import { webNotification } from '@signality/core';

@Component({
  template: `
    @if (notif.isSupported()) {
      @if (notif.permission() === 'default') { <!-- [!code warning] -->
        <button (click)="requestPermission()">
          Enable Notifications
        </button>
      } @else if (notif.notification() === 'granted') {
        <button (click)="showNotification()">
          Show Notification
        </button>
      }
    }
  `,
})
export class NotificationDemo {
  readonly notif = webNotification(); // [!code highlight]
  
  async requestPermission() {
    await this.notif.requestPermission();
  }
  
  showNotification() {
    this.notif.show('Hello!', {
      body: 'This is a notification from Signality',
    });
  }
}
```

## Parameters

| Parameter | Type                     | Description                                            |
|-----------|--------------------------|--------------------------------------------------------|
| `options` | `WebNotificationOptions` | Optional configuration (see [Options](#options) below) |

## Options

Extends standard [`NotificationOptions`](https://developer.mozilla.org/en-US/docs/Web/API/Notification/Notification) — any option set here becomes the default for every `show()` call.

| Option               | Type                       | Default  | Description                                                                  |
|----------------------|----------------------------|----------|------------------------------------------------------------------------------|
| `autoClose`          | `MaybeSignal<number>`      | -        | Auto-close notification after specified milliseconds                         |
| `injector`           | `Injector`                 | -        | Optional injector for DI context                                             |
| `badge`              | `string`                   | -        | URL of image shown when there isn't enough space to display the notification |
| `body`               | `string`                   | -        | Default body text                                                            |
| `data`               | `any`                      | -        | Arbitrary data to associate with the notification                            |
| `dir`                | `'ltr' \| 'rtl' \| 'auto'` | `'auto'` | Text direction                                                               |
| `icon`               | `string`                   | -        | Default icon URL                                                             |
| `image`              | `string`                   | -        | URL of image to display in the notification                                  |
| `lang`               | `string`                   | `''`     | Language code (BCP 47)                                                       |
| `renotify`           | `boolean`                  | `false`  | Notify when replacing an existing notification                               |
| `requireInteraction` | `boolean`                  | `false`  | Keep notification visible until user interacts                               |
| `silent`             | `boolean`                  | `false`  | Suppress sound and vibration                                                 |
| `tag`                | `string`                   | -        | Default tag for replacing notifications                                      |
| `timestamp`          | `number`                   | -        | Timestamp (Unix time in milliseconds)                                        |
| `vibrate`            | `number[]`                 | -        | Vibration pattern for device vibration hardware                              |

## Return Value

The `webNotification()` function returns a `WebNotificationRef` object:

| Property            | Type                                             | Description                                |
|---------------------|--------------------------------------------------|--------------------------------------------|
| `isSupported`       | `Signal<boolean>`                                | Whether Notifications API is supported     |
| `permission`        | `Signal<NotificationPermission>`                 | Current permission state                   |
| `notification`      | `Signal<Notification \| null>`                   | Current active notification instance       |
| `requestPermission` | `() => Promise<NotificationPermission>`          | Request notification permission            |
| `show`              | `(title, options?) => Notification \| undefined` | Show a notification (auto-closes previous) |
| `close`             | `() => void`                                     | Close the current notification             |

## Examples

### Auto-close notification

```angular-ts
import { Component, signal } from '@angular/core';
import { webNotification } from '@signality/core';

@Component({
  template: `<button (click)="showTempNotification()">Show Temp</button>`,
})
export class TempNotification {
  readonly notif = webNotification({ autoClose: 5000 }); // [!code highlight]
  
  showTempNotification() {
    // Automatically closes after 5 seconds
    this.notif.show('Quick update', {
      body: 'This will disappear in 5 seconds',
    });
  }
}
```

## Browser Compatibility

The Notifications API has limited browser support, especially on mobile devices. Always check `isSupported()` before using notifications (see [Browser API support detection](/guide/key-concepts#browser-api-support-detection)):

```angular-html
@if (notification.isSupported()) {
  <button (click)="notification.show('Hello!')">Show Notification</button>
} @else {
  <p>Notifications are not available in this browser</p>
}
```

For detailed browser support information, see [Can I use: Notifications API](https://caniuse.com/notifications).

## SSR Compatibility

On the server, signals initialize with safe defaults:

- `isSupported` → `false`
- `permission` → `'denied'`
- `notification` → `null`
- `requestPermission` → returns `'denied'`
- `show` → returns `undefined`
- `close` → no-op function

## Type Definitions

```typescript
interface WebNotificationOptions extends NotificationOptions, WithInjector {
  readonly autoClose?: MaybeSignal<number>;
}

interface WebNotificationRef {
  readonly isSupported: Signal<boolean>;
  readonly permission: Signal<NotificationPermission>;
  readonly notification: Signal<Notification | null>;
  readonly requestPermission: () => Promise<NotificationPermission>;
  readonly show: (title: string, options?: NotificationOptions) => Notification | undefined;
  readonly close: () => void;
}

function webNotification(options?: WebNotificationOptions): WebNotificationRef;
```

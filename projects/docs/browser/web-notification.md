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

```angular-ts
import { Component } from '@angular/core';
import { webNotification } from '@signality/core';

@Component({
  template: `
    @if (notif.isSupported()) {
      @if (notif.permission() === 'granted') {
        <button (click)="showNotification()">Send Notification</button>
      } @else {
        <button (click)="notif.requestPermission()">Enable Notifications</button>
      }
    }
  `,
})
export class NotificationDemo {
  readonly notif = webNotification(); // [!code highlight]
  
  showNotification() {
    this.notif.show('Hello!', {
      body: 'This is a notification from Signality',
      icon: '/icon.png',
    });
  }
}
```

## Parameters

| Parameter | Type                     | Description                                            |
|-----------|--------------------------|--------------------------------------------------------|
| `options` | `WebNotificationOptions` | Optional configuration (see [Options](#options) below) |

## Options

| Option      | Type                                                                     | Default | Description                                           |
|-------------|--------------------------------------------------------------------------|---------|-------------------------------------------------------|
| `autoClose` | [`MaybeSignal<number>`](/reference/utility-types#maybesignal-lt-type-gt) | -       | Auto-close notifications after specified milliseconds |
| `injector`  | [`Injector`](https://angular.dev/api/core/Injector)                      | -       | Optional injector for DI context                      |

## Return Value

The `webNotification()` function returns a `WebNotificationRef` object:

| Property            | Type                                             | Description                            |
|---------------------|--------------------------------------------------|----------------------------------------|
| `isSupported`       | `Signal<boolean>`                                | Whether Notifications API is supported |
| `permission`        | `Signal<NotificationPermission>`                 | Current permission state               |
| `requestPermission` | `() => Promise<NotificationPermission>`          | Request notification permission        |
| `show`              | `(title, options?) => Notification \| undefined` | Show a notification                    |
| `close`             | `(notification: Notification) => void`           | Close a notification                   |

## Examples

### New message notification

```angular-ts
import { Component, effect, signal } from '@angular/core';
import { webNotification } from '@signality/core';

interface Message {
  from: string;
  text: string;
}

@Component({ /* ... */ })
export class ChatNotifications {
  readonly notif = webNotification();
  readonly lastMessage = signal<Message | null>(null);
  
  constructor() {
    effect(() => {
      const msg = this.lastMessage();
      if (msg && document.hidden) {
        this.notif.show(`New message from ${msg.from}`, {
          body: msg.text,
          icon: '/avatar.png',
          tag: 'new-message', // Replaces previous with same tag // [!code highlight]
        });
      }
    });
  }
}
```

### Notification with actions

```angular-ts
import { Component } from '@angular/core';
import { webNotification } from '@signality/core';

@Component({
  template: `<button (click)="showActionNotification()">Notify</button>`,
})
export class ActionNotification {
  readonly notif = webNotification();
  
  showActionNotification() {
    const notification = this.notif.show('Meeting in 5 minutes', {
      body: 'Team standup starting soon',
      icon: '/calendar.png',
      requireInteraction: true,
    });
    
    if (notification) {
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }
  }
}
```

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

### Reactive auto-close

```angular-ts
import { Component, signal } from '@angular/core';
import { webNotification } from '@signality/core';

@Component({
  template: `
    <button (click)="showTempNotification()">Show Temp</button>
    <input type="number" [value]="closeDelay()" (input)="closeDelay.set(+$any($event.target).value)" />
  `,
})
export class ReactiveTempNotification {
  readonly closeDelay = signal(3000);
  readonly notif = webNotification({ autoClose: this.closeDelay }); // [!code highlight]
  
  showTempNotification() {
    // Auto-closes after delay specified in signal
    this.notif.show('Quick update', {
      body: `This will disappear in ${this.closeDelay()}ms`,
    });
  }
}
```

### Notification sound

```angular-ts
import { Component } from '@angular/core';
import { webNotification } from '@signality/core';

@Component({ /* ... */ })
export class SoundNotification {
  readonly notif = webNotification();
  
  notifyWithSound() {
    const notification = this.notif.show('Alert!', {
      body: 'Something important happened',
      silent: false, // Allow sound
    });
    
    // Play custom sound
    new Audio('/notification.mp3').play();
  }
}
```

## Notification Options

Standard [NotificationOptions](https://developer.mozilla.org/en-US/docs/Web/API/Notification/Notification):

| Option               | Type      | Description                         |
|----------------------|-----------|-------------------------------------|
| `body`               | `string`  | Notification body text              |
| `icon`               | `string`  | URL of icon to display              |
| `badge`              | `string`  | URL of badge image                  |
| `tag`                | `string`  | ID for replacing notifications      |
| `silent`             | `boolean` | Suppress sound                      |
| `requireInteraction` | `boolean` | Keep visible until user interaction |

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
- `requestPermission` → returns `'denied'`
- `show` → returns `undefined`
- `close` → no-op function

## Type Definitions

```typescript
interface WebNotificationOptions extends WithInjector {
  readonly autoClose?: MaybeSignal<number>;
}

interface WebNotificationRef {
  readonly isSupported: Signal<boolean>;
  readonly permission: Signal<NotificationPermission>;
  readonly requestPermission: () => Promise<NotificationPermission>;
  readonly show: (title: string, options?: NotificationOptions) => Notification | undefined;
  readonly close: (notification: Notification) => void;
}

function webNotification(options?: WebNotificationOptions): WebNotificationRef;
```

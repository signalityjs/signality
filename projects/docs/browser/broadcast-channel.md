---
source: https://github.com/signalityjs/signality/blob/main/projects/core/browser/broadcast-channel/index.ts
---

# BroadcastChannel

Reactive wrapper around the [Broadcast Channel API](https://developer.mozilla.org/en-US/docs/Web/API/Broadcast_Channel_API). Communicate between browser tabs/windows with Angular signals.

<Demo name="broadcast-channel" />

## Usage

```angular-ts
import { Component, effect } from '@angular/core';
import { broadcastChannel } from '@signality/core';

@Component({
  template: `
    <input (input)="channel.post($event.target.value)" />
    <p>Last message: {{ channel.data() }}</p>
  `,
})
export class SyncedInput {
  readonly channel = broadcastChannel<string>('my-channel'); // [!code highlight]
  
  constructor() {
    effect(() => {
      console.log('Received:', this.channel.data());
    });
  }
}
```

## Parameters

| Parameter | Type                      | Description                                            |
|-----------|---------------------------|--------------------------------------------------------|
| `name`    | `string`                  | Channel name (must match across tabs)                  |
| `options` | `BroadcastChannelOptions` | Optional configuration (see [Options](#options) below) |

## Options

The `BroadcastChannelOptions` extends `WithInjector`:

| Option     | Type                                                | Description                      |
|------------|-----------------------------------------------------|----------------------------------|
| `injector` | [`Injector`](https://angular.dev/api/core/Injector) | Optional injector for DI context |

## Return Value

The `broadcastChannel()` function returns a `BroadcastChannelRef` object:

| Property   | Type                           | Description                                                                                                  |
|------------|--------------------------------|--------------------------------------------------------------------------------------------------------------|
| `data`     | `Signal<T \| null>`            | Last received data                                                                                           |
| `error`    | `Signal<MessageEvent \| null>` | Last error that occurred (see [MessageEvent](https://developer.mozilla.org/en-US/docs/Web/API/MessageEvent)) |
| `isClosed` | `Signal<boolean>`              | Whether the channel is closed                                                                                |
| `post`     | `(data: T) => void`            | Send message to all tabs                                                                                     |
| `close`    | `() => void`                   | Close the channel                                                                                            |

## Examples

### Logout across all tabs

```angular-ts
import { Injectable, inject, effect } from '@angular/core';
import { Router } from '@angular/router';
import { broadcastChannel } from '@signality/core';

@Injectable({ /* ... */ })
export class AuthService {
  readonly router = inject(Router);
  readonly logoutChannel = broadcastChannel<boolean>('logout');
  
  constructor() {
    effect(() => {
      if (this.logoutChannel.data() === true) {
        this.router.navigate(['/login']);
      }
    });
  }
  
  logout() {
    // Notify all tabs // [!code warning]
    this.logoutChannel.post(true); // [!code warning]
    this.router.navigate(['/login']);
  }
}
```

### Sync user state across tabs

```angular-ts
import { Component, effect } from '@angular/core';
import { broadcastChannel } from '@signality/core';

interface UserState {
  isLoggedIn: boolean;
  theme: 'light' | 'dark';
}

@Component({
  template: `
    <button (click)="toggleTheme()">Toggle Theme</button>
    <p>Theme: {{ state()?.theme }}</p>
  `,
})
export class SyncedSettings {
  readonly channel = broadcastChannel<UserState>('user-state');
  
  readonly state = this.channel.data;
  
  toggleTheme() {
    const current = this.state() || { isLoggedIn: true, theme: 'light' };
    this.channel.post({
      ...current,
      theme: current.theme === 'light' ? 'dark' : 'light',
    });
  }
}
```

## SSR Compatibility

On the server, signals initialize with safe defaults:

- `data` → `null`
- `error` → `null`
- `isClosed` → `false`
- `post`, `close` → no-op functions

## Type Definitions

```typescript
type BroadcastChannelOptions = WithInjector;

interface BroadcastChannelRef<T> {
  readonly data: Signal<T | null>;
  readonly error: Signal<MessageEvent | null>;
  readonly isClosed: Signal<boolean>;
  readonly post: (data: T) => void;
  readonly close: () => void;
}

function broadcastChannel<T>(
  name: string,
  options?: BroadcastChannelOptions,
): BroadcastChannelRef<T>;
```

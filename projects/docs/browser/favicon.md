---
source: https://github.com/signalityjs/signality/blob/main/projects/core/browser/favicon/index.ts
---

# Favicon

Reactive favicon manipulation. Dynamically change the page favicon based on application state.

<Demo name="favicon" />

## Usage

```angular-ts
import { Component } from '@angular/core';
import { favicon } from '@signality/core';

@Component({
  template: `
    <button (click)="setNotification()">Show Notification</button>
    <button (click)="reset()">Reset</button>
  `,
})
export class FaviconDemo {
  readonly fav = favicon(); // [!code highlight]
  
  setNotification() {
    this.fav.set('/favicon-notification.ico');
  }
  
  reset() {
    this.fav.reset();
  }
}
```

::: warning Use InjectionToken for Singleton
For global state tracking like `favicon`, consider using the provided `FAVICON` token instead of calling the function directly. This provides a singleton instance that can be shared across your entire application, reducing memory usage and event listener overhead:

```typescript
import { inject } from '@angular/core';
import { FAVICON } from '@signality/core';

const fav = favicon(); // [!code --]
const fav = inject(FAVICON); // [!code ++]
```

Learn more about [Token-based utilities](/guide/key-concepts#token-based-utilities).
:::

## Parameters

| Parameter | Type             | Description                                            |
|-----------|------------------|--------------------------------------------------------|
| `options` | `FaviconOptions` | Optional configuration (see [Options](#options) below) |

## Options

The `FaviconOptions` extends `WithInjector` and includes:

| Option     | Type                                                | Default                 | Description                                                                                                                                                        |
|------------|-----------------------------------------------------|-------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `baseUrl`  | `string`                                            | `APP_BASE_HREF` or `''` | Base URL for favicon paths. If not provided, uses [`APP_BASE_HREF`](https://angular.dev/api/common/APP_BASE_HREF) token value if available, otherwise empty string |
| `injector` | [`Injector`](https://angular.dev/api/core/Injector) | -                       | Optional injector for DI context                                                                                                                                   |

### Base URL resolution

The `baseUrl` option follows this priority:

1. Explicit `baseUrl` value in options
2. [`APP_BASE_HREF`](https://angular.dev/api/common/APP_BASE_HREF) token value (if configured)
3. Empty string `''`

This allows the utility to automatically respect Angular's base href configuration:

```angular-ts
import { ApplicationConfig } from '@angular/core';
import { APP_BASE_HREF } from '@angular/common';
import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app';

export const appConfig: ApplicationConfig = {
  providers: [
    // ...
    { provide: APP_BASE_HREF, useValue: '/my-app/' } // [!code ++]
  ]
};

bootstrapApplication(App, appConfig);
```

## Return Value

The `favicon()` function returns a `FaviconRef` object:

| Property   | Type                      | Description                      |
|------------|---------------------------|----------------------------------|
| `current`  | `Signal<string>`          | Current favicon URL              |
| `original` | `Signal<string>`          | Original favicon URL (for reset) |
| `set`      | `(url: string) => void`   | Set favicon to URL               |
| `setEmoji` | `(emoji: string) => void` | Set favicon to emoji             |
| `reset`    | `() => void`              | Reset to original favicon        |

## Examples

### Notification badge

```angular-ts
import { Component, effect, signal } from '@angular/core';
import { favicon } from '@signality/core';

@Component({
  template: `
    <p>Unread: {{ unreadCount() }}</p>
    <button (click)="markAllRead()">Mark all read</button>
  `,
})
export class NotificationBadge {
  readonly fav = favicon();
  readonly unreadCount = signal(0);
  
  constructor() {
    effect(() => {
      const count = this.unreadCount();
      if (count > 0) {
        this.fav.setEmoji('🔴');
      } else {
        this.fav.reset();
      }
    });
  }
  
  markAllRead() {
    this.unreadCount.set(0);
  }
}
```

### Theme-based favicon

```angular-ts
import { Component, effect } from '@angular/core';
import { favicon, mediaQuery } from '@signality/core';

@Component({ /* ... */ })
export class ThemeFavicon {
  readonly fav = favicon();
  readonly prefersDark = mediaQuery('(prefers-color-scheme: dark)');
  
  constructor() {
    effect(() => {
      if (this.prefersDark()) {
        this.fav.set('/favicon-dark.svg');
      } else {
        this.fav.set('/favicon-light.svg');
      }
    });
  }
}
```

### Build status indicator

```angular-ts
import { Component, effect, signal } from '@angular/core';
import { favicon } from '@signality/core';

type BuildStatus = 'pending' | 'success' | 'error';

@Component({
  template: `<p>Build: {{ status() }}</p>`,
})
export class BuildStatus {
  readonly fav = favicon();
  readonly status = signal<BuildStatus>('pending');
  readonly emojis: Record<BuildStatus, string> = {
    pending: '🟡',
    success: '✅',
    error: '❌',
  };
  
  constructor() {
    effect(() => {
      this.fav.setEmoji(this.emojis[this.status()]);
    });
  }
}
```

## SSR Compatibility

On the server, signals initialize with safe defaults:

- `current`, `original` → `''`
- `set`, `setEmoji`, `reset` → no-op functions

## Type Definitions

```typescript
interface FaviconOptions extends WithInjector {
  readonly baseUrl?: string;
}

interface FaviconRef {
  readonly current: Signal<string>;
  readonly original: Signal<string>;
  readonly set: (url: string) => void;
  readonly setEmoji: (emoji: string) => void;
  readonly reset: () => void;
}

function favicon(options?: FaviconOptions): FaviconRef;

const FAVICON: InjectionToken<FaviconRef>;
```

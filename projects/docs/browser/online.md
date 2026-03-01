---
source: https://github.com/signalityjs/signality/blob/main/projects/core/browser/online/index.ts
---

# Online

Reactive wrapper around the browser's [online/offline status](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/onLine). Returns a signal that tracks whether the browser is currently online or offline.

<Demo name="online" />

## Usage

```angular-ts
import { Component, effect } from '@angular/core';
import { online } from '@signality/core';

@Component({
  template: `
    <p [class.offline]="!isOnline()">
      {{ isOnline() ? '🟢 Online' : '🔴 Offline' }}
    </p>
  `,
})
export class OnlineStatus {
  readonly isOnline = online(); // [!code highlight]
}
```

::: warning Use InjectionToken for Singleton
For global state tracking like `online`, consider using the provided `ONLINE` token instead of calling the function directly. This provides a singleton instance that can be shared across your entire application, reducing memory usage and event listener overhead:

```typescript
import { inject } from '@angular/core';
import { ONLINE } from '@signality/core';

const isOnline = online(); // [!code --]
const isOnline = inject(ONLINE); // [!code ++]
```

Learn more about [Token-based utilities](/guide/key-concepts#token-based-utilities).
:::

## Parameters

| Parameter | Type              | Description                                            |
|-----------|-------------------|--------------------------------------------------------|
| `options` | `OnlineOptions`   | Optional configuration (see [Options](#options) below) |

## Options

The `OnlineOptions` extends Angular's [`CreateSignalOptions<boolean>`](https://angular.dev/api/core/CreateSignalOptions) and `WithInjector`:

| Option      | Type                      | Description                                    |
|-------------|---------------------------|------------------------------------------------|
| `equal`     | [`ValueEqualityFn<boolean>`](https://angular.dev/api/core/ValueEqualityFn) | Custom equality function ([see more](https://angular.dev/guide/signals#signal-equality-functions)) |
| `debugName` | `string`                  | Debug name for the signal (development only)   |
| `injector`  | [`Injector`](https://angular.dev/api/core/Injector)                | Optional injector for DI context               |

## Return Value

Returns a `Signal<boolean>` containing the current online status:
- `true` - Browser is online
- `false` - Browser is offline

## Examples

### Offline banner

```angular-ts
import { Component, computed } from '@angular/core';
import { online } from '@signality/core';

@Component({
  template: `
    @if (!isOnline()) {
      <div class="offline-banner">
        <p>⚠️ You are currently offline. Some features may be unavailable.</p>
      </div>
    }
  `,
})
export class OfflineBanner {
  readonly isOnline = online();
}
```

### Disable form when offline

```angular-ts
import { Component } from '@angular/core';
import { online } from '@signality/core';

@Component({
  template: `
    <form [disabled]="!isOnline()">
      <input type="text" placeholder="Enter your name" />
      <button type="submit" [disabled]="!isOnline()">
        Submit
      </button>
    </form>
    @if (!isOnline()) {
      <p class="warning">Form is disabled while offline</p>
    }
  `,
})
export class OfflineForm {
  readonly isOnline = online();
}
```

### Queue actions when offline

```angular-ts
import { Component, effect, signal } from '@angular/core';
import { online } from '@signality/core';

@Component({
  template: `
    <p>Queued actions: {{ queuedActions().length }}</p>
    <button (click)="addAction()">Add Action</button>
    <button (click)="processQueue()" [disabled]="!isOnline()">
      Process Queue
    </button>
  `,
})
export class ActionQueue {
  readonly isOnline = online();
  readonly queuedActions = signal<string[]>([]);

  constructor() {
    effect(() => {
      if (this.isOnline() && this.queuedActions().length > 0) {
        this.processQueue();
      }
    });
  }

  addAction() {
    this.queuedActions.update(actions => [...actions, `Action ${Date.now()}`]);
  }

  processQueue() {
    // Process queued actions
    this.queuedActions.set([]);
  }
}
```

## SSR Compatibility

On the server, the signal initializes with `true`.

## Type Definitions

```typescript
type OnlineOptions = CreateSignalOptions<boolean> & WithInjector;

function online(options?: OnlineOptions): Signal<boolean>;
```

## Related

- [Network](/browser/network) — Comprehensive network information including connection type and speed


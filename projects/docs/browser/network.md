---
source: https://github.com/signalityjs/signality/blob/main/projects/core/browser/network/index.ts
---

# Network

Reactive wrapper around the [Network Information API](https://developer.mozilla.org/en-US/docs/Web/API/Network_Information_API). Track network connection information with Angular signals.

<Demo name="network" />

## Usage

```angular-ts
import { Component } from '@angular/core';
import { network } from '@signality/core';

@Component({
  template: `
    <p [class.offline]="!net.isOnline()">
      {{ net.isOnline() ? '🟢 Online' : '🔴 Offline' }}
    </p>
  `,
})
export class NetworkStatus {
  readonly net = network(); // [!code highlight]
}
```

::: warning Use InjectionToken for Singleton
For global state tracking like `network`, consider using the provided `NETWORK` token instead of calling the function directly. This ensures a singleton instance shared across your entire application, reducing memory usage and event listener overhead:

```typescript
import { inject } from '@angular/core';
import { NETWORK } from '@signality/core';

const net = network(); // [!code --]
const net = inject(NETWORK); // [!code ++]
```

Learn more about [Token-based utilities](/guide/key-concepts#token-based-utilities).
:::

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `options` | `WithInjector` | Optional configuration |

## Options

| Option | Type | Description |
|--------|------|-------------|
| `injector` | [`Injector`](https://angular.dev/api/core/Injector) | Optional injector for DI context |

## Return Value

The `network()` function returns a `NetworkRef` object:

| Property | Type | Description |
|----------|------|-------------|
| `isOnline` | `Signal<boolean>` | Whether the browser is online (provided by [`ONLINE`](/browser/online) token) |
| `isSupported` | `Signal<boolean>` | Whether Network Information API is supported |
| `effectiveType` | `Signal<'slow-2g' \| '2g' \| '3g' \| '4g' \| undefined>` | Effective connection type |
| `downlink` | `Signal<number \| undefined>` | Downlink speed in Mbps |
| `rtt` | `Signal<number \| undefined>` | Round-trip time in ms |
| `saveData` | `Signal<boolean>` | Whether user has data saver enabled |
| `type` | `Signal<ConnectionType \| undefined>` | Connection type (wifi, cellular, etc.) |

## Examples

### Offline banner

```angular-ts
import { Component } from '@angular/core';
import { network } from '@signality/core';

@Component({
  template: `
    @if (!net.isOnline()) {
      <div class="offline-banner">
        You are offline. Some features may be unavailable.
      </div>
    }
    <ng-content />
  `,
})
export class OfflineBanner {
  readonly net = network(); // [!code highlight]
}
```

### Adaptive media quality

```angular-ts
import { Component, computed } from '@angular/core';
import { network } from '@signality/core';

@Component({
  template: `<img [src]="imageSrc()" alt="Adaptive image" />`,
})
export class AdaptiveImage {
  readonly net = network();
  
  readonly imageSrc = computed(() => {
    const type = this.net.effectiveType();
    
    switch (type) {
      case 'slow-2g':
      case '2g':
        return '/images/photo-low.jpg';
      case '3g':
        return '/images/photo-medium.jpg';
      case '4g':
      default:
        return '/images/photo-high.jpg';
    }
  });
}
```

## Browser Compatibility

The Network Information API has limited browser support. Always check `isSupported()` before relying on network information (see [Browser API support detection](/guide/key-concepts#browser-api-support-detection)):

```angular-html
@if (network.isSupported()) {
  <p>Connection: {{ network.effectiveType() }}</p>
} @else {
  <p>Network information is not available in this browser</p>
}
```

For detailed browser support information, see [Can I use: Network Information API](https://caniuse.com/netinfo).

## SSR Compatibility

On the server, signals initialize with safe defaults:

- `isOnline` → `true`
- `isSupported` → `false`
- `effectiveType`, `downlink`, `rtt`, `type` → `undefined`
- `saveData` → `false`

## Type Definitions

```typescript
type EffectiveConnectionType = 'slow-2g' | '2g' | '3g' | '4g';
type ConnectionType = 'bluetooth' | 'cellular' | 'ethernet' | 'wifi' | 'wimax' | 'none' | 'other' | 'unknown';

interface NetworkRef {
  readonly isOnline: Signal<boolean>;
  readonly isSupported: Signal<boolean>;
  readonly effectiveType: Signal<EffectiveConnectionType | undefined>;
  readonly downlink: Signal<number | undefined>;
  readonly rtt: Signal<number | undefined>;
  readonly saveData: Signal<boolean>;
  readonly type: Signal<ConnectionType | undefined>;
}

function network(options?: WithInjector): NetworkRef;
```


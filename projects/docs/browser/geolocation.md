---
source: https://github.com/signalityjs/signality/blob/main/projects/core/browser/geolocation/index.ts
---

# Geolocation

Reactive wrapper around the [Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API). Track user location with Angular signals.

::: warning Secure Context Required
This feature is available only in [secure contexts](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Secure_Contexts) (HTTPS) or potentially trustworthy origins (such as `localhost` or `127.0.0.1`). Regular `http://` URLs will not work in most browsers.
:::

<Demo name="geolocation" />

## Usage

```angular-ts
import { Component } from '@angular/core';
import { geolocation } from '@signality/core';

@Component({
  template: `
    @if (geo.position()?.coords; as coords) {
      <p>📍 {{ coords.latitude }}, {{ coords.longitude }}</p>
    } @else {
      <button (click)="geo.start()">Get Location</button>
    }
  `,
})
export class LocationDemo {
  readonly geo = geolocation(); // [!code highlight]
}
```

## Parameters

| Parameter | Type                 | Description                                           |
|-----------|----------------------|-------------------------------------------------------|
| `options` | `GeolocationOptions` | Configuration options (see [Options](#options) below) |

## Options

| Option               | Type                                                | Default    | Description                      |
|----------------------|-----------------------------------------------------|------------|----------------------------------|
| `immediate`          | `boolean`                                           | `true`     | Start tracking immediately       |
| `enableHighAccuracy` | `boolean`                                           | `true`     | Use GPS for better accuracy      |
| `maximumAge`         | `number`                                            | `0`        | Max age of cached position (ms)  |
| `timeout`            | `number`                                            | `Infinity` | Request timeout (ms)             |
| `injector`           | [`Injector`](https://angular.dev/api/core/Injector) | -          | Optional injector for DI context |

## Return Value

Returns a `GeolocationRef`:

| Property      | Type                                       | Description                          |
|---------------|--------------------------------------------|--------------------------------------|
| `position`    | `Signal<GeolocationPosition \| null>`      | Full position object with timestamp  |
| `error`       | `Signal<GeolocationPositionError \| null>` | Last error                           |
| `isSupported` | `Signal<boolean>`                          | Whether Geolocation API is supported |
| `isActive`    | `Signal<boolean>`                          | Whether location tracking is active  |
| `isLoading`   | `Signal<boolean>`                          | Whether currently fetching location  |
| `stop`        | `() => void`                               | Stop watching position               |
| `start`       | `() => void`                               | Start/resume watching position       |

## Examples

### Show on map

```angular-ts
import { Component, effect, viewChild, ElementRef } from '@angular/core';
import { geolocation } from '@signality/core';

@Component({
  template: `
    <div #map class="map"></div>
    @if (geo.isLoading()) {
      <p>Getting location...</p>
    }
    @if (geo.error()) {
      <p class="error">{{ geo.error()?.message }}</p>
    }
  `,
})
export class MapComponent {
  readonly mapEl = viewChild<ElementRef>('map');
  readonly geo = geolocation();
  
  constructor() {
    effect(() => {
      const coords = this.geo.position()?.coords;
      if (coords) {
        this.updateMarker(coords.latitude, coords.longitude);
      }
    });
  }
  
  private updateMarker(lat: number, lng: number) {
    // Update map marker position
  }
}
```

### Distance calculator

```angular-ts
import { Component, signal, computed } from '@angular/core';
import { geolocation } from '@signality/core';

@Component({
  template: `
    <p>Your location: {{ formattedCoords() }}</p>
    <p>Distance to destination: {{ distanceKm() }} km</p>
  `,
})
export class DistanceCalculator {
  readonly geo = geolocation();
  readonly destination = signal({ lat: 40.7128, lng: -74.0060 }); // NYC
  
  readonly formattedCoords = computed(() => {
    const coords = this.geo.position()?.coords;
    if (!coords) return 'Loading...';
    return `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`;
  });
  
  readonly distanceKm = computed(() => {
    const coords = this.geo.position()?.coords;
    if (!coords) return '...';
    
    const distance = this.haversineDistance(
      coords.latitude,
      coords.longitude,
      this.destination().lat,
      this.destination().lng
    );
    
    return distance.toFixed(1);
  });
  
  private haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
}
```

## SSR Compatibility

On the server, signals initialize with safe defaults:

- `position`, `error` → `null`
- `isSupported` → `false`
- `isActive`, `isLoading` → `false`
- `stop`, `start` → no-op functions

## Type Definitions

```typescript
interface GeolocationOptions extends WithInjector {
  readonly immediate?: boolean;
  readonly enableHighAccuracy?: boolean;
  readonly maximumAge?: number;
  readonly timeout?: number;
}

interface GeolocationRef {
  readonly position: Signal<GeolocationPosition | null>;
  readonly error: Signal<GeolocationPositionError | null>;
  readonly isSupported: Signal<boolean>;
  readonly isActive: Signal<boolean>;
  readonly isLoading: Signal<boolean>;
  readonly stop: () => void;
  readonly start: () => void;
}

function geolocation(options?: GeolocationOptions): GeolocationRef;
```

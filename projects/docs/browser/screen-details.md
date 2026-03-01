---
source: https://github.com/signalityjs/signality/blob/main/projects/core/browser/screen-details/index.ts
---

# ScreenDetails

Reactive wrapper around the [Window Management API](https://developer.mozilla.org/en-US/docs/Web/API/Window_Management_API). Track multiple screens and their properties with Angular signals.

<Demo name="screen-details" />

## Usage

```angular-ts
import { Component, effect } from '@angular/core';
import { screenDetails } from '@signality/core';

@Component({
  template: `
    @if (screens.isSupported()) {
      <p>Total screens: {{ screens.screens().length }}</p>
      @if (screens.currentScreen()) {
        <p>Current: {{ screens.currentScreen()?.label }}</p>
      }
    } @else {
      <p>Window Management API is not supported</p>
    }
  `,
})
export class ScreensDemo {
  readonly screens = screenDetails(); // [!code highlight]
  
  constructor() {
    effect(() => {
      console.log('Screens:', this.screens.screens());
      console.log('Current:', this.screens.currentScreen());
    });
  }
}
```

## Parameters

| Parameter | Type              | Description                                            |
|-----------|-------------------|--------------------------------------------------------|
| `options` | `WithInjector`    | Optional configuration (see [Options](#options) below) |

## Options

The `WithInjector` interface provides:

| Option     | Type       | Description                                    |
|------------|------------|------------------------------------------------|
| `injector` | [`Injector`](https://angular.dev/api/core/Injector) | Optional injector for DI context               |

## Return Value

The `screenDetails()` function returns a `ScreenDetailsRef` object:

| Property | Type | Description |
|----------|------|-------------|
| `isSupported` | `Signal<boolean>` | Whether Window Management API is supported |
| `screens` | `Signal<readonly ScreenDetailsInfo[]>` | List of all available screens |
| `currentScreen` | `Signal<ScreenDetailsInfo \| undefined>` | Current screen (primary) |

## Browser Compatibility

The Window Management API has limited browser support and requires user permission. Always check `isSupported()` before using (see [Browser API support detection](/guide/key-concepts#browser-api-support-detection)):

```angular-html
@if (screens.isSupported()) {
  <p>Screens: {{ screens.screens().length }}</p>
} @else {
  <p>Window Management API is not supported in this browser</p>
}
```

For detailed browser support information, see [Can I use: Window Management API](https://caniuse.com/window-management-api).

## Examples

### Multi-screen layout

```angular-ts
import { Component, computed } from '@angular/core';
import { screenDetails } from '@signality/core';

@Component({
  template: `
    <div class="screens-grid">
      @for (screen of screens.screens(); track screen.id) {
        <div class="screen-card" [class.primary]="screen.isPrimary">
          <h3>{{ screen.label }}</h3>
          <p>{{ screen.width }}x{{ screen.height }}</p>
          <p>{{ screen.isPrimary ? 'Primary' : 'Secondary' }}</p>
        </div>
      }
    </div>
  `,
})
export class MultiScreenLayout {
  readonly screens = screenDetails();
}
```

### Window positioning

```angular-ts
import { Component } from '@angular/core';
import { screenDetails } from '@signality/core';

@Component({
  template: `
    <button (click)="moveToSecondary()">Move to Secondary Screen</button>
  `,
})
export class WindowPosition {
  readonly screens = screenDetails();
  
  moveToSecondary() {
    const secondary = this.screens.screens().find(s => !s.isPrimary);
    if (secondary && window.moveTo) {
      window.moveTo(secondary.left + 100, secondary.top + 100);
    }
  }
}
```

## SSR Compatibility

On the server, signals initialize with safe defaults:

- `isSupported` → `false`
- `screens` → `[]`
- `currentScreen` → `undefined`

## Type Definitions

```typescript
interface ScreenDetailsInfo {
  readonly id: string;
  readonly label: string;
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
  readonly colorDepth: number;
  readonly pixelDepth: number;
  readonly isPrimary: boolean;
  readonly isInternal: boolean;
  readonly pointerTypes: readonly string[];
}

interface ScreenDetailsRef {
  readonly isSupported: Signal<boolean>;
  readonly screens: Signal<readonly ScreenDetailsInfo[]>;
  readonly currentScreen: Signal<ScreenDetailsInfo | undefined>;
}

function screenDetails(options?: WithInjector): ScreenDetailsRef;
```

## Related

- [ScreenOrientation](/browser/screen-orientation) — Screen orientation tracking
- [WindowSize](/elements/window-size) — Window dimensions tracking


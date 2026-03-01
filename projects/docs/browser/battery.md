---
source: https://github.com/signalityjs/signality/blob/main/projects/core/browser/battery/index.ts
---

# Battery

Reactive wrapper around the [Battery Status API](https://developer.mozilla.org/en-US/docs/Web/API/Battery_Status_API).

<Demo name="battery" />

## Usage

```angular-ts
import { Component } from '@angular/core';
import { PercentPipe } from '@angular/common';
import { battery } from '@signality/core';

@Component({
  template: `
    <div>
      <p>Battery: {{ battery.level() | percent }}</p>
      <p>{{ battery.charging() ? 'Charging' : 'Not charging' }}</p>
    </div>
  `,
})
export class BatteryDemo {
  readonly battery = battery(); // [!code highlight]
}
```

## Return Value

The `battery()` function returns a `BatteryRef` object with the following properties:

| Property          | Type              | Description                                                                   |
|-------------------|-------------------|-------------------------------------------------------------------------------|
| `level`           | `Signal<number>`  | Battery level from 0.0 (empty) to 1.0 (full)                                  |
| `charging`        | `Signal<boolean>` | Whether the battery is currently charging                                     |
| `chargingTime`    | `Signal<number>`  | Time in seconds until the battery is fully charged (Infinity if not charging) |
| `dischargingTime` | `Signal<number>`  | Time in seconds until the battery is fully discharged (Infinity if charging)  |
| `isSupported`     | `Signal<boolean>` | Whether the Battery Status API is supported                                   |

## Examples

### Low battery warning

```angular-ts
import { Component, computed } from '@angular/core';
import { PercentPipe } from '@angular/common';
import { battery } from '@signality/core';

@Component({
  template: `
    @if (showWarning()) {
      <div class="warning">
        Low battery! {{ battery.level() | percent }} remaining
      </div>
    }
  `,
})
export class LowBatteryWarning {
  readonly battery = battery();
  
  readonly showWarning = computed(() => 
    this.battery.level() < 0.2 && !this.battery.charging()
  );
}
```

### Estimated time display

```angular-ts
import { Component, computed } from '@angular/core';
import { battery } from '@signality/core';

@Component({
  template: `
    <p>{{ timeRemaining() }}</p>
  `,
})
export class TimeRemainingComponent {
  readonly battery = battery();
  
  readonly timeRemaining = computed(() => {
    if (this.battery.charging()) {
      const time = this.battery.chargingTime();
      if (time === Infinity) return 'Calculating...';
      return `Full in ${Math.round(time / 60)} minutes`;
    } else {
      const time = this.battery.dischargingTime();
      if (time === Infinity) return 'Calculating...';
      return `${Math.round(time / 60)} minutes remaining`;
    }
  });
}
```

## Browser Compatibility

The Battery Status API has limited browser support. Always check `isSupported()` before relying on battery data (see [Browser API support detection](/guide/key-concepts#browser-api-support-detection)):

```angular-html
@if (battery.isSupported()) {
  <p>Battery: {{ battery.level() * 100 }}%</p>
} @else {
  <p>Battery info not available</p>
}
```

For detailed browser support information, see [Can I use: Battery Status API](https://caniuse.com/battery-status).

## SSR Compatibility

On the server, signals initialize with safe defaults:

- `level` → `1` (100%)
- `charging` → `false`
- `chargingTime` → `0`
- `dischargingTime` → `0`
- `isSupported` → `false`

## Type Definitions

```typescript
type BatteryOptions = WithInjector;

interface BatteryRef {
  readonly charging: Signal<boolean>;
  readonly chargingTime: Signal<number>;
  readonly dischargingTime: Signal<number>;
  readonly level: Signal<number>;
  readonly isSupported: Signal<boolean>;
}

function battery(options?: WithInjector): BatteryRef;
```

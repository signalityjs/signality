---
source: https://github.com/signalityjs/signality/blob/main/projects/core/elements/swipe/index.ts
---

# Swipe

Reactive touch-swipe detection on an element. Tracks single-finger swipe gestures and provides direction and distance signals.

<Demo name="swipe" />

## Usage

```angular-ts
import { Component, viewChild, ElementRef } from '@angular/core';
import { swipe } from '@signality/core';

@Component({
  template: `
    <div #area style="touch-action: none; width: 300px; height: 300px;">
      <p>Swiping: {{ sw.isSwiping() }}</p>
      <p>Direction: {{ sw.direction() }}</p>
    </div>
  `,
})
export class SwipeDemo {
  readonly area = viewChild<ElementRef>('area');
  readonly sw = swipe(this.area); // [!code highlight]
}
```

## Parameters

| Parameter | Type                              | Description                                          |
|-----------|-----------------------------------|------------------------------------------------------|
| `target`  | [`MaybeElementSignal<HTMLElement>`](/reference/utility-types#maybeelementsignal-lt-type-gt) | Element to detect swipe gestures on                  |
| `options` | `SwipeOptions`                    | Optional configuration (see [Options](#options) below) |

## Options

The `SwipeOptions` extends `WithInjector`:

| Option      | Type       | Default | Description                                      |
|-------------|------------|---------|--------------------------------------------------|
| `threshold` | `number`   | `50`    | Minimum distance in pixels before a swipe is recognized |
| `injector`  | [`Injector`](https://angular.dev/api/core/Injector) | -       | Optional injector for DI context                 |

## Return Value

Returns a `SwipeRef`:

| Property    | Type                       | Description                                              |
|-------------|----------------------------|----------------------------------------------------------|
| `isSwiping` | `Signal<boolean>`          | Whether a swipe gesture is currently in progress         |
| `direction` | `Signal<SwipeDirection>`   | Current swipe direction (`'up'`, `'down'`, `'left'`, `'right'`, or `'none'`) |
| `distanceX` | `Signal<number>`           | Horizontal distance from start (positive = swiped left)  |
| `distanceY` | `Signal<number>`           | Vertical distance from start (positive = swiped up)      |

## Examples

### Swipe-to-dismiss

Card follows your finger and disappears when released past 150 px.

```angular-ts
import { Component, viewChild, ElementRef, linkedSignal } from '@angular/core';
import { swipe } from '@signality/core';

@Component({
  template: `
    @if (visible()) {
      <div
        #card
        style="touch-action: pan-y"
        [style.transform]="'translateX(' + sw.distanceX() * -1 + 'px)'"
        [style.transition]="sw.isSwiping() ? 'none' : 'all .3s ease'"
      >
        Swipe left or right to dismiss
      </div>
    } @else {
      <button (click)="visible.set(true)">Show again</button>
    }
  `,
})
export class SwipeDismissDemo {
  readonly card = viewChild<ElementRef>('card');
  readonly sw = swipe(this.card); // [!code highlight]

  readonly visible = linkedSignal({
    source: () => !this.sw.isSwiping() && Math.abs(this.sw.distanceX()) >= 150,
    computation: dismissed => !dismissed,
  });
}
```

### Direction indicator

```angular-ts
import { Component, viewChild, ElementRef, computed } from '@angular/core';
import { swipe } from '@signality/core';

@Component({
  template: `
    <div #area style="touch-action: none">
      <p>{{ arrow() }}</p>
      <p>Distance: {{ sw.distanceX() }}px / {{ sw.distanceY() }}px</p>
    </div>
  `,
})
export class DirectionDemo {
  readonly area = viewChild<ElementRef>('area');
  readonly sw = swipe(this.area);

  readonly arrow = computed(() => {
    switch (this.sw.direction()) {
      case 'up': return 'Up';
      case 'down': return 'Down';
      case 'left': return 'Left';
      case 'right': return 'Right';
      default: return 'Swipe in any direction';
    }
  });
}
```

## SSR Compatibility

On the server, signals initialize with safe defaults:

- `isSwiping` → `false`
- `direction` → `'none'`
- `distanceX` → `0`
- `distanceY` → `0`

## Type Definitions

```typescript
type SwipeDirection = 'up' | 'down' | 'left' | 'right' | 'none';

interface SwipeOptions extends WithInjector {
  readonly threshold?: number;
}

interface SwipeRef {
  readonly isSwiping: Signal<boolean>;
  readonly direction: Signal<SwipeDirection>;
  readonly distanceX: Signal<number>;
  readonly distanceY: Signal<number>;
}

function swipe(
  target: MaybeElementSignal<HTMLElement>,
  options?: SwipeOptions
): SwipeRef;
```

## Related

- [OnLongPress](/elements/on-long-press) — Detect long press gestures on an element
- [Mouse](/elements/mouse) — Track mouse position on an element

---
source: https://github.com/signalityjs/signality/blob/main/projects/core/elements/pointer-swipe/index.ts
---

# PointerSwipe

Reactive pointer-swipe detection on an element. Tracks swipe gestures using [Pointer Events](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events) and provides direction and distance signals. Works with mouse, touch, and pen input.

<Demo name="pointer-swipe" />

## Usage

```angular-ts
import { Component, viewChild, ElementRef } from '@angular/core';
import { pointerSwipe } from '@signality/core';

@Component({
  template: `
    <div #area style="touch-action: none; user-select: none">
      <p>Swiping: {{ sw.isSwiping() }}</p>
      <p>Direction: {{ sw.direction() }}</p>
    </div>
  `,
})
export class PointerSwipeDemo {
  readonly area = viewChild<ElementRef>('area');
  readonly sw = pointerSwipe(this.area); // [!code highlight]
}
```

## Parameters

| Parameter | Type                                                                                        | Description                                            |
|-----------|---------------------------------------------------------------------------------------------|--------------------------------------------------------|
| `target`  | [`MaybeElementSignal<HTMLElement>`](/reference/utility-types#maybeelementsignal-lt-type-gt) | Element to detect swipe gestures on                    |
| `options` | `PointerSwipeOptions`                                                                       | Optional configuration (see [Options](#options) below) |

## Options

The `PointerSwipeOptions` extends `WithInjector`:

| Option         | Type                                                | Default                     | Description                                             |
|----------------|-----------------------------------------------------|-----------------------------|---------------------------------------------------------|
| `threshold`    | `number`                                            | `50`                        | Minimum distance in pixels before a swipe is recognized |
| `pointerTypes` | `PointerType[]`                                     | `['mouse', 'touch', 'pen']` | Pointer types to listen for                             |
| `injector`     | [`Injector`](https://angular.dev/api/core/Injector) | -                           | Optional injector for DI context                        |

## Return Value

Returns a `PointerSwipeRef`:

| Property    | Type                            | Description                                                                  |
|-------------|---------------------------------|------------------------------------------------------------------------------|
| `isSwiping` | `Signal<boolean>`               | Whether a swipe gesture is currently in progress                             |
| `direction` | `Signal<PointerSwipeDirection>` | Current swipe direction (`'up'`, `'down'`, `'left'`, `'right'`, or `'none'`) |
| `distanceX` | `Signal<number>`                | Horizontal distance from start (positive = swiped left)                      |
| `distanceY` | `Signal<number>`                | Vertical distance from start (positive = swiped up)                          |

## Examples

### Mouse-only swipe

Restrict detection to mouse input only.

```angular-ts
import { Component, viewChild, ElementRef, computed } from '@angular/core';
import { pointerSwipe } from '@signality/core';

@Component({
  template: `
    <div #area style="touch-action: none; user-select: none">
      <p>{{ arrow() }}</p>
      <p>Distance: {{ sw.distanceX() }}px / {{ sw.distanceY() }}px</p>
    </div>
  `,
})
export class MouseSwipeDemo {
  readonly area = viewChild<ElementRef>('area');
  readonly sw = pointerSwipe(this.area, { pointerTypes: ['mouse'] }); // [!code highlight]

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
type PointerType = 'mouse' | 'touch' | 'pen';

type PointerSwipeDirection = 'up' | 'down' | 'left' | 'right' | 'none';

interface PointerSwipeOptions extends WithInjector {
  readonly threshold?: number;
  readonly pointerTypes?: PointerType[];
}

interface PointerSwipeRef {
  readonly isSwiping: Signal<boolean>;
  readonly direction: Signal<PointerSwipeDirection>;
  readonly distanceX: Signal<number>;
  readonly distanceY: Signal<number>;
}

function pointerSwipe(
  target: MaybeElementSignal<HTMLElement>,
  options?: PointerSwipeOptions
): PointerSwipeRef;
```

## Related

- [Swipe](/elements/swipe) — Touch-only swipe detection on an element
- [OnLongPress](/elements/on-long-press) — Detect long press gestures on an element
- [MousePosition](/elements/mouse-position) — Track mouse position on an element

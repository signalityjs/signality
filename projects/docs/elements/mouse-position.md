---
source: https://github.com/signalityjs/signality/blob/main/projects/core/elements/mouse/index.ts
---

# MousePosition

Reactive tracking of mouse position. Track cursor coordinates globally or relative to an element.

<Demo name="mouse-position" />

## Usage

```angular-ts
import { Component } from '@angular/core';
import { mousePosition } from '@signality/core';

@Component({
  template: `
    <p>Mouse: {{ mousePos().x }}, {{ mousePos().y }}</p>
  `,
})
export class MousePositionDemo {
  readonly mousePos = mousePosition(); // [!code highlight]
}
```

## Options

| Option         | Type                                                                                                | Default          | Description                                 |
|----------------|-----------------------------------------------------------------------------------------------------|------------------|---------------------------------------------|
| `target`       | [`MaybeElementSignal<Element>`](/reference/utility-types#maybeelementsignal-lt-type-gt) \| `Window` | `window`         | Element or window to track mousePosition on |
| `type`         | `'page' \| 'client' \| 'screen'`                                                                    | `'page'`         | Coordinate type                             |
| `touch`        | `boolean`                                                                                           | `true`           | Track touch events too                      |
| `initialValue` | `{ x: number, y: number }`                                                                          | `{ x: 0, y: 0 }` | Initial position                            |
| `injector`     | [`Injector`](https://angular.dev/api/core/Injector)                                                 | -                | Optional injector for DI context            |

## Return Value

The `mousePosition()` function returns a `Signal<MousePosition>`:

```typescript
interface MousePosition {
  x: number;
  y: number;
}
```

| Property | Description                                                  |
|----------|--------------------------------------------------------------|
| `x`      | X coordinate (depends on `type`: pageX, clientX, or screenX) |
| `y`      | Y coordinate (depends on `type`: pageY, clientY, or screenY) |

## Examples

### Cursor follower

```angular-ts
import { Component } from '@angular/core';
import { mousePosition } from '@signality/core';

@Component({
  template: `
    <div
      class="cursor-follower"
      [style.left.px]="position().x - 20"
      [style.top.px]="position().y - 20"
    ></div>
  `,
  styles: `
    .cursor-follower {
      position: fixed;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(147, 51, 234, 0.3);
      pointer-events: none;
      transition: transform 0.1s ease;
    }
  `,
})
export class CursorFollower {
  readonly position = mousePosition({ type: 'client' });
}
```

### Track mousePosition on a specific element

```angular-ts
import { Component, viewChild, ElementRef } from '@angular/core';
import { mousePosition } from '@signality/core';

@Component({
  template: `
    <div #area class="tracking-area">
      <p>Position: {{ position().x }}, {{ position().y }}</p>
    </div>
  `,
})
export class ElementMouseTracker {
  readonly area = viewChild<ElementRef>('area');
  readonly position = mousePosition({ target: this.area });
}
```

## SSR Compatibility

On the server, the signal returns the initial value:

- `x` → `0`
- `y` → `0`

## Type Definitions

```typescript
interface MousePosition {
  readonly x: number;
  readonly y: number;
}

type MouseCoordinateType = 'page' | 'client' | 'screen';

interface MousePositionOptions extends WithInjector {
  readonly target?: MaybeElementSignal<Element> | Window;
  readonly type?: MouseCoordinateType;
  readonly touch?: boolean;
  readonly initialValue?: MousePosition;
}

function mousePosition(options?: MousePositionOptions): Signal<MousePosition>;
```

## Related

- [ElementHover](/elements/element-hover) — Track hover state
- [ScrollPosition](/elements/scroll-position) — Track scroll position

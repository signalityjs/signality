---
source: https://github.com/signalityjs/signality/blob/main/projects/core/elements/on-long-press/index.ts
---

# OnLongPress

Detect long press gestures on an element. Calls a callback after a configurable delay if the pointer stays down without moving beyond the distance threshold.

<Demo name="long-press" />

## Usage

```angular-ts
import { Component, viewChild, ElementRef } from '@angular/core';
import { onLongPress } from '@signality/core';

@Component({
  template: `<button #btn>Hold me</button>`,
})
export class LongPressDemo {
  readonly btn = viewChild<ElementRef>('btn');

  constructor() {
    onLongPress(this.btn, event => { // [!code highlight]
      console.log('Long press detected!', event.clientX, event.clientY);
    });
  }
}
```

## Parameters

| Parameter | Type                              | Description                                          |
|-----------|-----------------------------------|------------------------------------------------------|
| `target`  | [`MaybeElementSignal<HTMLElement>`](/reference/utility-types#maybeelementsignal-lt-type-gt) | Target element to detect long presses on             |
| `handler` | `(event: PointerEvent) => void`   | Callback invoked when a long press is detected       |
| `options` | `OnLongPressOptions`                | Optional configuration (see [Options](#options) below) |

## Options

The `OnLongPressOptions` extends `WithInjector`:

| Option              | Type                    | Default | Description                                                        |
|---------------------|-------------------------|---------|--------------------------------------------------------------------|
| `delay`             | `MaybeSignal<number>`   | `500`   | Time in ms before the callback is triggered                        |
| `distanceThreshold` | `number \| false`       | `10`    | Max distance (px) the pointer can move before cancelling. Set to `false` to disable |
| `modifiers`         | `OnLongPressModifiers`    | -       | Keyboard modifiers required during the press                       |
| `injector`          | [`Injector`](https://angular.dev/api/core/Injector) | -       | Optional injector for DI context                                   |

### OnLongPressModifiers

| Property | Type      | Description                        |
|----------|-----------|------------------------------------|
| `ctrl`   | `boolean` | Require Ctrl key to be held        |
| `shift`  | `boolean` | Require Shift key to be held       |
| `alt`    | `boolean` | Require Alt key to be held         |
| `meta`   | `boolean` | Require Meta (Cmd/Win) key to be held |

## Return Value

Returns a `OnLongPressRef` with a `destroy` method to stop detection:

| Property  | Type         | Description                      |
|-----------|--------------|----------------------------------|
| `destroy` | `() => void` | Stops long press detection       |

## Examples

### Custom delay

```angular-ts
import { Component, viewChild, ElementRef, signal } from '@angular/core';
import { onLongPress } from '@signality/core';

@Component({
  template: `<button #btn>Hold for 1 second</button>`,
})
export class CustomDelayDemo {
  readonly btn = viewChild<ElementRef>('btn');

  constructor() {
    onLongPress(this.btn, () => {
      console.log('Long press after 1s!');
    }, { delay: 1000 }); // [!code highlight]
  }
}
```

### With modifier keys

```angular-ts
import { Component, viewChild, ElementRef } from '@angular/core';
import { onLongPress } from '@signality/core';

@Component({
  template: `<div #area>Ctrl + Hold to activate</div>`,
})
export class ModifierDemo {
  readonly area = viewChild<ElementRef>('area');

  constructor() {
    onLongPress(this.area, () => {
      console.log('Ctrl + long press!');
    }, { modifiers: { ctrl: true } }); // [!code highlight]
  }
}
```

### Disable distance threshold

```angular-ts
import { Component, viewChild, ElementRef } from '@angular/core';
import { onLongPress } from '@signality/core';

@Component({
  template: `<div #area>Hold anywhere</div>`,
})
export class NoDistanceDemo {
  readonly area = viewChild<ElementRef>('area');

  constructor() {
    onLongPress(this.area, () => {
      console.log('Long press — movement ignored!');
    }, { distanceThreshold: false }); // [!code highlight]
  }
}
```

## SSR Compatibility

On the server, the utility returns a no-op ref with an empty `destroy` method.

## Type Definitions

```typescript
interface OnLongPressModifiers {
  readonly ctrl?: boolean;
  readonly shift?: boolean;
  readonly alt?: boolean;
  readonly meta?: boolean;
}

interface OnLongPressOptions extends WithInjector {
  readonly delay?: MaybeSignal<number>;
  readonly distanceThreshold?: number | false;
  readonly modifiers?: OnLongPressModifiers;
}

interface OnLongPressRef {
  readonly destroy: () => void;
}

function onLongPress(
  target: MaybeElementSignal<HTMLElement>,
  handler: (event: PointerEvent) => void,
  options?: OnLongPressOptions
): OnLongPressRef;
```

## Related

- [Listener](/browser/listener) — Low-level event listener utility
- [ElementFocus](/elements/element-focus) — Track focus state on an element

---
source: https://github.com/signalityjs/signality/blob/main/projects/core/elements/element-hover/index.ts
---

# ElementHover

Reactive tracking of hover state on an element. Detects when the mouse enters or leaves an element.

<Demo name="element-hover" />

## Usage

```angular-ts
import { Component, viewChild, ElementRef } from '@angular/core';
import { elementHover } from '@signality/core';

@Component({
  template: `
    <div #box [class.hovered]="hovered()">
      {{ hovered() ? 'Hovering!' : 'Hover me' }}
    </div>
  `,
})
export class HoverDemo {
  readonly box = viewChild<ElementRef>('box');
  readonly hovered = elementHover(this.box); // [!code highlight]
}
```

## Parameters

| Parameter | Type                                                                                        | Description                                            |
|-----------|---------------------------------------------------------------------------------------------|--------------------------------------------------------|
| `target`  | [`MaybeElementSignal<HTMLElement>`](/reference/utility-types#maybeelementsignal-lt-type-gt) | Target element to track                                |
| `options` | `ElementHoverOptions`                                                                       | Optional configuration (see [Options](#options) below) |

## Options

The `ElementHoverOptions` extends [`CreateSignalOptions<boolean>`](https://angular.dev/api/core/CreateSignalOptions) and `WithInjector`:

| Option      | Type                                                                       | Description                                                                                        |
|-------------|----------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------|
| `equal`     | [`ValueEqualityFn<boolean>`](https://angular.dev/api/core/ValueEqualityFn) | Custom equality function ([see more](https://angular.dev/guide/signals#signal-equality-functions)) |
| `debugName` | `string`                                                                   | Debug name for the signal (development only)                                                       |
| `injector`  | [`Injector`](https://angular.dev/api/core/Injector)                        | Optional injector for DI context                                                                   |

## Return Value

Returns a `Signal<boolean>` containing `true` when the element is being hovered, `false` otherwise.

## SSR Compatibility

On the server, the signal initializes with `false`.

> **Note:** On mobile devices, the signal also initializes with `false` since hover state is not available on touch devices.

## Type Definitions

```typescript
type ElementHoverOptions = CreateSignalOptions<boolean> & WithInjector;

function elementHover(
  target: MaybeElementSignal<HTMLElement>,
  options?: ElementHoverOptions
): Signal<boolean>;
```

## Related

- [ElementFocus](/elements/element-focus) — Track focus state instead of hover
- [Mouse](/elements/mouse) — Track mouse position

---
source: https://github.com/signalityjs/signality/blob/main/projects/core/observers/resize-observer/index.ts
---

# ResizeObserver

Low-level utility for observing element size changes using the [ResizeObserver API](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver). Provides fine-grained control over observation lifecycle.

<Demo name="resize-observer" />

## Usage

### Single element observation

Observe a single element by passing it as the first parameter:

```angular-ts
import { Component, inject, ElementRef } from '@angular/core';
import { resizeObserver } from '@signality/core';

@Component({ 
  template: `<div>Resize me!</div>`,
})
export class Resize {
  readonly el = inject(ElementRef);
  readonly observer = resizeObserver(this.el, console.log); // [!code highlight]
}
```

### Multiple elements observation

Observe multiple elements by passing an array:

```angular-ts
import { Component, viewChild, ElementRef } from '@angular/core';
import { resizeObserver } from '@signality/core';

@Component({
  template: `
    <div #box1>Box 1</div>
    <div #box2>Box 2</div>
  `,
})
export class MultipleResize {
  readonly box1 = viewChild<ElementRef>('box1');
  readonly box2 = viewChild<ElementRef>('box2');
  
  readonly observer = resizeObserver(
    [this.box1, this.box2], // [!code highlight]
    entries => {
      for (const entry of entries) {
        console.log('Resized:', entry.target);
      }
    }
  );
}
```

### With reactive box option

The `box` option can be a reactive:

```angular-ts
import { Component, viewChild, ElementRef, signal } from '@angular/core';
import { resizeObserver } from '@signality/core';

@Component({
  template: `<div #box>Resize me!</div>`,
})
export class BoxOptionResize {
  readonly box = viewChild<ElementRef>('box');
  readonly boxType = input<ResizeObserverBoxOptions>('content-box'); // [!code highlight]
  
  readonly observer = resizeObserver(
    this.box,
    entries => {
      console.log('Resized:', entries);
    },
    { box: this.boxType }
  );
}
```

### Manual cleanup

Observers are automatically disconnected after the view is destroyed (see [Automatic cleanup](/guide/key-concepts#automatic-cleanup)). However, the returned `ResizeObserverRef` can be destroyed to stop observation manually:

```angular-ts
import { Component, viewChild, ElementRef } from '@angular/core';
import { resizeObserver } from '@signality/core';

@Component({
  template: `<div #box>Resize me!</div>`,
})
export class ManualCleanup {
  readonly box = viewChild<ElementRef>('box');
  readonly observer = resizeObserver(this.box, console.log);

  manualCleanup() {
    // stop observing
    this.observer.destroy();
  }
}
```

## Parameters

| Parameter  | Type                                                                                                                                                                                 | Description                                                                                                                                                                                                                                                |
|------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `target`   | [`MaybeElementSignal<Element>`](/reference/utility-types#maybeelementsignal-lt-type-gt) \| [`MaybeElementSignal<Element>`](/reference/utility-types#maybeelementsignal-lt-type-gt)[] | Element(s) to observe. Can be a single element or array. Can be:<br/>- A plain `Element` or `ElementRef<Element>`<br/>- A `Signal<Element>` or `Signal<ElementRef<Element>>`<br/>- `undefined` (observation is skipped)<br/>- An array of any of the above |
| `callback` | `(entries: readonly ResizeObserverEntry[]) => void`                                                                                                                                  | Callback function called when observed elements resize                                                                                                                                                                                                     |
| `options`  | `ResizeObserverInitOptions`                                                                                                                                                          | Optional configuration (see [Options](#options) below)                                                                                                                                                                                                     |

## Options

The `ResizeObserverInitOptions` extends [`Omit<CreateEffectOptions, 'allowSignalWrites'>`](https://angular.dev/api/core/CreateEffectOptions):

| Option                                                                               | Type                                                                                       | Default | Description                                                                                                                                    |
|--------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------|---------|------------------------------------------------------------------------------------------------------------------------------------------------|
| [`box`](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver/observe#box) | [`MaybeSignal<ResizeObserverBoxOptions>`](/reference/utility-types#maybesignal-lt-type-gt) | -       | Which box model to observe                                                                                                                     |
| `manualCleanup`                                                                      | `boolean`                                                                                  | `false` | If `true`, the effect requires manual cleanup. By default, the effect automatically registers itself for cleanup with the current `DestroyRef` |
| `debugName`                                                                          | `string`                                                                                   | -       | Debug name for the effect (used in Angular DevTools)                                                                                           |
| `injector`                                                                           | [`Injector`](https://angular.dev/api/core/Injector)                                        | -       | Optional injector for DI context                                                                                                               |

**Box Options:**

- `'border-box'` - Observe border box dimensions (default)
- `'content-box'` - Observe content box dimensions
- `'device-pixel-content-box'` - Observe device pixel content box dimensions

## Return Value

Returns a `ResizeObserverRef` with a `destroy()` method to stop observing the element(s).

## Examples

### Conditional observation

Observe elements conditionally:

```angular-ts
import { Component, viewChild, ElementRef, computed } from '@angular/core';
import { resizeObserver } from '@signality/core';

@Component({
  template: `
    <div #box>Box</div>
    <button (click)="enabled.set(!enabled())">
      {{ enabled() ? 'Disable' : 'Enable' }} Observation
    </button>
  `,
})
export class ConditionalResize {
  readonly box = viewChild<ElementRef>('box');
  readonly enabled = signal(true);
  
  readonly observer = resizeObserver(
    computed(() => (this.enabled() ? this.box() : undefined)), // [!code highlight]
    entries => {
      console.log('Resized:', entries);
    }
  );
}
```

## SSR Compatibility

On the server, `resizeObserver` returns a no-op `ResizeObserverRef` that safely handles `destroy()` calls without creating actual observers.

## Type Definitions

```typescript
interface ResizeObserverInitOptions extends Omit<CreateEffectOptions, 'allowSignalWrites'> {
  readonly box?: MaybeSignal<ResizeObserverBoxOptions>;
}

interface ResizeObserverRef {
  readonly destroy: () => void;
}

function resizeObserver(
  target: MaybeElementSignal<Element> | MaybeElementSignal<Element>[],
  callback: (entries: readonly ResizeObserverEntry[]) => void,
  options?: ResizeObserverInitOptions
): ResizeObserverRef;
```

## Related

- [ElementSize](/elements/element-size) — High-level reactive size tracking using ResizeObserver
- [WindowSize](/elements/window-size) — Track window dimensions

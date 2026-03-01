---
source: https://github.com/signalityjs/signality/blob/main/projects/core/observers/intersection-observer/index.ts
---

# IntersectionObserver

Low-level utility for observing element intersection with viewport using the [IntersectionObserver API](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver). Provides fine-grained control over observation lifecycle.

<Demo name="intersection-observer" />

## Usage

### Single element observation

Observe a single element by passing it as the first parameter:

```angular-ts
import { Component, inject, ElementRef } from '@angular/core';
import { intersectionObserver } from '@signality/core';

@Component({ 
  template: `<div>Scroll to see intersection!</div>`,
})
export class Intersection {
  readonly el = inject(ElementRef);
  readonly observer = intersectionObserver(this.el, console.log); // [!code highlight]
}
```

### Multiple elements observation

Observe multiple elements by passing an array:

```angular-ts
import { Component, viewChild, ElementRef } from '@angular/core';
import { intersectionObserver } from '@signality/core';

@Component({
  template: `
    <div #child1>Child 1</div>
    <div #child2>Child 2</div>
  `,
})
export class MultipleIntersection {
  readonly child1 = viewChild<ElementRef>('child1');
  readonly child2 = viewChild<ElementRef>('child2');
  
  readonly observer = intersectionObserver(
    [this.child1, this.child2], // [!code highlight]
    (entries, observer) => {
      for (const entry of entries) {
        console.log('Intersecting:', entry.isIntersecting);
      }
    }
  );
}
```

### With reactive options

All options (`root`, `rootMargin`, `threshold`) can be reactive:

```angular-ts
import { Component, signal, viewChild, ElementRef } from '@angular/core';
import { intersectionObserver } from '@signality/core';

@Component({
  template: `
    <div #container>
      <div #box>Observed element</div>
    </div>
    <button (click)="threshold.set(threshold() === 0.5 ? 0.9 : 0.5)">
      Toggle threshold
    </button>
  `,
})
export class ReactiveOptions {
  readonly box = viewChild<ElementRef>('box');

  readonly root = viewChild<ElementRef>('container'); // [!code highlight]
  readonly rootMargin = input('10px'); // [!code highlight]
  readonly threshold = signal(0.5); // [!code highlight]
  
  readonly observer = intersectionObserver(
    this.box,
    entries => { /* callback */ },
    {
      root: this.root, // Reactive root element
      rootMargin: this.rootMargin, // Reactive margin
      threshold: this.threshold, // Reactive threshold
    }
  );
}
```

### Manual cleanup

Observers are automatically disconnected after the view is destroyed (see [Automatic cleanup](/guide/key-concepts#automatic-cleanup)). However, the returned `IntersectionObserverRef` can be destroyed to stop observation manually:

```angular-ts
import { Component, viewChild, ElementRef } from '@angular/core';
import { intersectionObserver } from '@signality/core';

@Component({
  template: `<div #box>Scroll me!</div>`,
})
export class ManualCleanup {
  readonly box = viewChild<ElementRef>('box');
  readonly observer = intersectionObserver(this.box, console.log);

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
| `callback` | `(entries: readonly IntersectionObserverEntry[], observer: IntersectionObserver) => void`                                                                                            | Callback function called when observed elements intersect with viewport                                                                                                                                                                                    |
| `options`  | `IntersectionObserverInitOptions`                                                                                                                                                    | Optional configuration (see [Options](#options) below)                                                                                                                                                                                                     |

## Options

The `IntersectionObserverInitOptions` extends [`Omit<CreateEffectOptions, 'allowSignalWrites'>`](https://angular.dev/api/core/CreateEffectOptions):

| Option                                                                                                | Type                                                                                                  | Default | Description                                                                                                                                    |
|-------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------|---------|------------------------------------------------------------------------------------------------------------------------------------------------|
| [`root`](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API#root)             | [`MaybeElementSignal<Element>`](/reference/utility-types#maybeelementsignal-lt-type-gt) \| `Document` \| `null` | -       | The element that is used as the viewport for checking visibility                                                                               |
| [`rootMargin`](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API#rootmargin) | [`MaybeSignal<string>`](/reference/utility-types#maybesignal-lt-type-gt)                              | -       | Margin around the root element                                                                                                                 |
| [`threshold`](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API#threshold)   | [`MaybeSignal<number \| number[]>`](/reference/utility-types#maybesignal-lt-type-gt)                  | -       | Threshold(s) for intersection                                                                                                                  |
| `manualCleanup`                                                                                       | `boolean`                                                                                             | `false` | If `true`, the effect requires manual cleanup. By default, the effect automatically registers itself for cleanup with the current `DestroyRef` |
| `debugName`                                                                                           | `string`                                                                                              | -       | Debug name for the effect (used in Angular DevTools)                                                                                           |
| `injector`                                                                                            | [`Injector`](https://angular.dev/api/core/Injector)                                                   | -       | Optional injector for DI context                                                                                                               |

## Return Value

Returns an `IntersectionObserverRef` with a `destroy()` method to stop observing the element(s).

## Examples

### Scroll animations

```angular-ts
import { Component, viewChild, ElementRef } from '@angular/core';
import { intersectionObserver } from '@signality/core';

@Component({
  template: `
    <div #section [class.visible]="isVisible()">
      Content that animates on scroll
    </div>
  `,
})
export class ScrollAnimation {
  readonly section = viewChild<ElementRef>('section');
  readonly isVisible = signal(false);

  constructor() {
    intersectionObserver(
      this.section,
      entries => {
        for (const entry of entries) {
          this.isVisible.set(entry.isIntersecting);
        }
      },
      { threshold: 0.1 }
    );
  }
}
```

### Conditional observation

Observe elements conditionally:

```angular-ts
import { Component, viewChild, ElementRef, computed } from '@angular/core';
import { intersectionObserver } from '@signality/core';

@Component({
  template: `
    <div #box>Box</div>
    <button (click)="enabled.set(!enabled())">
      {{ enabled() ? 'Disable' : 'Enable' }} Observation
    </button>
  `,
})
export class ConditionalIntersection {
  readonly box = viewChild<ElementRef>('box');
  readonly enabled = signal(true);
  
  readonly observer = intersectionObserver(
    computed(() => (this.enabled() ? this.box() : undefined)), // [!code highlight]
    (entries, observer) => {
      console.log('Intersected:', entries);
    }
  );
}
```

## SSR Compatibility

On the server, `intersectionObserver` returns a no-op `IntersectionObserverRef` that safely handles `destroy()` calls without creating actual observers.

## Type Definitions

```typescript
interface IntersectionObserverInitOptions extends Omit<CreateEffectOptions, 'allowSignalWrites'> {
  readonly root?: MaybeElementSignal<Element> | Document | null;
  readonly rootMargin?: MaybeSignal<string>;
  readonly threshold?: MaybeSignal<number | number[]>;
}

interface IntersectionObserverRef {
  readonly destroy: () => void;
}

function intersectionObserver(
  target: MaybeElementSignal<Element> | MaybeElementSignal<Element>[],
  callback: (entries: readonly IntersectionObserverEntry[], observer: IntersectionObserver) => void,
  options?: IntersectionObserverInitOptions
): IntersectionObserverRef;
```

## Related

- [ElementVisibility](/elements/element-visibility) — High-level reactive visibility tracking using IntersectionObserver
- [ResizeObserver](/observers/resize-observer) — Observe element size changes

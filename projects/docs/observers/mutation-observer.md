---
source: https://github.com/signalityjs/signality/blob/main/projects/core/observers/mutation-observer/index.ts
---

# MutationObserver

Low-level utility for observing DOM tree changes using the [MutationObserver API](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver). Provides fine-grained control over observation lifecycle.

<Demo name="mutation-observer" />

## Usage

::: warning
For type safety, this utility accepts only `Element` rather than `Node`, even though the [MutationObserver API](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver) works with any node. Accessing text or comment nodes typically requires direct DOM manipulation, which we aim to avoid — hence, only element is allowed.
:::

### Single element observation

Observe a single element by passing it as the first parameter:

```angular-ts
import { Component, inject, ElementRef } from '@angular/core';
import { mutationObserver } from '@signality/core';

@Component({ 
  template: `<div>Content that may change</div>`,
})
export class Mutation {
  readonly el = inject(ElementRef);
  readonly observer = mutationObserver(this.el, console.log, { childList: true }); // [!code highlight]
}
```

### Multiple elements observation

Observe multiple elements by passing an array:

```angular-ts
import { Component, viewChild, ElementRef } from '@angular/core';
import { mutationObserver } from '@signality/core';

@Component({
  template: `
    <div #child1>Child 1</div>
    <div #child2>Child 2</div>
  `,
})
export class MultipleMutation {
  readonly child1 = viewChild<ElementRef>('child1');
  readonly child2 = viewChild<ElementRef>('child2');
  
  readonly observer = mutationObserver(
    [this.child1, this.child2], // [!code highlight]
    mutations => {
      for (const mutation of mutations) {
        console.log('Mutation:', mutation.type);
      }
    },
    { childList: true }
  );
}
```

### With reactive options

The options can be reactive signals:

```angular-ts
import { Component, viewChild, ElementRef, signal } from '@angular/core';
import { mutationObserver } from '@signality/core';

@Component({
  template: `<div #box>Content</div>`,
})
export class ReactiveOptionsMutation {
  readonly box = viewChild<ElementRef>('box');
  readonly watchChildren = input(true); // [!code highlight]
  
  readonly observer = mutationObserver(
    this.box,
    mutations => {
      console.log('Mutations:', mutations);
    },
    { childList: this.watchChildren } // [!code highlight]
  );
}
```

### Manual cleanup

Observers are automatically disconnected after the view is destroyed (see [Automatic cleanup](/guide/key-concepts#automatic-cleanup)). However, the returned `MutationObserverRef` can be destroyed to stop observation manually:

```angular-ts
import { Component, viewChild, ElementRef } from '@angular/core';
import { mutationObserver } from '@signality/core';

@Component({
  template: `<div #box>Content</div>`,
})
export class ManualCleanup {
  readonly box = viewChild<ElementRef>('box');
  readonly observer = mutationObserver(this.box, console.log, { childList: true });

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
| `callback` | `(mutations: readonly MutationRecord[], observer: MutationObserver) => void`                                                                                                         | Callback function called when DOM mutations occur                                                                                                                                                                                                          |
| `options`  | `MutationObserverInitOptions`                                                                                                                                                        | **Required.** Configuration for the observer (see [Options](#options) below). At least one of `childList`, `attributes`, or `characterData` must be specified.                                                                                             |

## Options

The `MutationObserverInitOptions` extends [`Omit<CreateEffectOptions, 'allowSignalWrites'>`](https://angular.dev/api/core/CreateEffectOptions):

| Option                                                                                                                     | Type                                                                       | Default | Description                                                                                                                                    |
|----------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------|---------|------------------------------------------------------------------------------------------------------------------------------------------------|
| [`childList`](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver/observe#childlist)                         | [`MaybeSignal<boolean>`](/reference/utility-types#maybesignal-lt-type-gt)  | -       | Observe child node additions/removals                                                                                                          |
| [`attributes`](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver/observe#attributes)                       | [`MaybeSignal<boolean>`](/reference/utility-types#maybesignal-lt-type-gt)  | -       | Observe attribute changes                                                                                                                      |
| [`characterData`](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver/observe#characterdata)                 | [`MaybeSignal<boolean>`](/reference/utility-types#maybesignal-lt-type-gt)  | -       | Observe text node changes                                                                                                                      |
| [`subtree`](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver/observe#subtree)                             | [`MaybeSignal<boolean>`](/reference/utility-types#maybesignal-lt-type-gt)  | -       | Observe descendants                                                                                                                            |
| [`attributeOldValue`](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver/observe#attributeoldvalue)         | [`MaybeSignal<boolean>`](/reference/utility-types#maybesignal-lt-type-gt)  | -       | Include old attribute value in records                                                                                                         |
| [`characterDataOldValue`](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver/observe#characterdataoldvalue) | [`MaybeSignal<boolean>`](/reference/utility-types#maybesignal-lt-type-gt)  | -       | Include old text value in records                                                                                                              |
| [`attributeFilter`](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver/observe#attributefilter)             | [`MaybeSignal<string[]>`](/reference/utility-types#maybesignal-lt-type-gt) | -       | Filter specific attributes                                                                                                                     |
| `manualCleanup`                                                                                                            | `boolean`                                                                  | `false` | If `true`, the effect requires manual cleanup. By default, the effect automatically registers itself for cleanup with the current `DestroyRef` |
| `debugName`                                                                                                                | `string`                                                                   | -       | Debug name for the effect (used in Angular DevTools)                                                                                           |
| `injector`                                                                                                                 | [`Injector`](https://angular.dev/api/core/Injector)                        | -       | Optional injector for DI context                                                                                                               |

## Return Value

Returns a `MutationObserverRef` with a `destroy()` method to stop observing the element(s).

## Examples

### Conditional observation

Observe elements conditionally:

```angular-ts
import { Component, viewChild, ElementRef, computed } from '@angular/core';
import { mutationObserver } from '@signality/core';

@Component({
  template: `
    <div #box>Box</div>
    <button (click)="enabled.set(!enabled())">
      {{ enabled() ? 'Disable' : 'Enable' }} Observation
    </button>
  `,
})
export class ConditionalMutation {
  readonly box = viewChild<ElementRef>('box');
  readonly enabled = signal(true);
  
  readonly observer = mutationObserver(
    computed(() => (this.enabled() ? this.box() : undefined)), // [!code highlight]
    mutations => {
      console.log('Mutations:', mutations);
    },
    { childList: true }
  );
}
```

## SSR Compatibility

On the server, `mutationObserver` returns a no-op `MutationObserverRef` that safely handles `destroy()` calls without creating actual observers.

## Type Definitions

```typescript
interface MutationObserverInitOptions extends Omit<CreateEffectOptions, 'allowSignalWrites'> {
  readonly childList?: MaybeSignal<boolean>;
  readonly attributes?: MaybeSignal<boolean>;
  readonly characterData?: MaybeSignal<boolean>;
  readonly subtree?: MaybeSignal<boolean>;
  readonly attributeOldValue?: MaybeSignal<boolean>;
  readonly characterDataOldValue?: MaybeSignal<boolean>;
  readonly attributeFilter?: MaybeSignal<string[]>;
}

interface MutationObserverRef {
  readonly destroy: () => void;
}

function mutationObserver(
  target: MaybeElementSignal<Element> | MaybeElementSignal<Element>[],
  callback: (mutations: readonly MutationRecord[], observer: MutationObserver) => void,
  options: MutationObserverInitOptions
): MutationObserverRef;
```

## Related

- [ResizeObserver](/observers/resize-observer) — Observe element size changes
- [IntersectionObserver](/observers/intersection-observer) — Observe element intersection with viewport

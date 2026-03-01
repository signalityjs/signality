---
source: https://github.com/signalityjs/signality/blob/main/projects/core/elements/element-visibility/index.ts
---

# ElementVisibility

Reactive tracking of element visibility in the viewport using [IntersectionObserver](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API). Perfect for lazy loading and scroll animations.

<Demo name="element-visibility" />

## Usage

```angular-ts
import { Component, viewChild, ElementRef } from '@angular/core';
import { elementVisibility } from '@signality/core';

@Component({
  template: `
    <div #section [class.visible]="visibility().isVisible">
      {{ visibility().isVisible ? 'In viewport!' : 'Scroll to see me' }}
    </div>
  `,
})
export class VisibilityDemo {
  readonly section = viewChild<ElementRef>('section');
  readonly visibility = elementVisibility(this.section); // [!code highlight]
}
```

## Parameters

| Parameter | Type                                                                                        | Description                                            |
|-----------|---------------------------------------------------------------------------------------------|--------------------------------------------------------|
| `target`  | [`MaybeElementSignal<HTMLElement>`](/reference/utility-types#maybeelementsignal-lt-type-gt) | Target element to observe                              |
| `options` | `ElementVisibilityOptions`                                                                  | Optional configuration (see [Options](#options) below) |

## Options

The `ElementVisibilityOptions` extends [`CreateSignalOptions<ElementVisibilityValue>`](https://angular.dev/api/core/CreateSignalOptions) and `WithInjector`:

| Option                                                                                                | Type                                                                                                  | Default     | Description                                                                                        |
|-------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------|-------------|----------------------------------------------------------------------------------------------------|
| [`threshold`](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API#threshold)   | [`MaybeSignal<number \| number[]>`](/reference/utility-types#maybesignal-lt-type-gt)                  | `0`         | Visibility threshold(s)                                                                            |
| [`root`](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API#root)             | [`MaybeElementSignal<Element>`](/reference/utility-types#maybeelementsignal-lt-type-gt) \| `Document` | `undefined` | Scrollable ancestor (null = viewport)                                                              |
| [`rootMargin`](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API#rootmargin) | [`MaybeSignal<string>`](/reference/utility-types#maybesignal-lt-type-gt)                              | `'0px'`     | Margin around root                                                                                 |
| `equal`                                                                                               | [`ValueEqualityFn<ElementVisibilityValue>`](https://angular.dev/api/core/ValueEqualityFn)             | -           | Custom equality function ([see more](https://angular.dev/guide/signals#signal-equality-functions)) |
| `debugName`                                                                                           | `string`                                                                                              | -           | Debug name for the signal (development only)                                                       |
| `injector`                                                                                            | [`Injector`](https://angular.dev/api/core/Injector)                                                   | -           | Optional injector for DI context                                                                   |

## Return Value

The `elementVisibility()` function returns a `Signal<ElementVisibilityValue>`:

```typescript
interface ElementVisibilityValue {
  isVisible: boolean;
  ratio: number;
}
```

| Property    | Type      | Description                            |
|-------------|-----------|----------------------------------------|
| `isVisible` | `boolean` | Whether element is visible in viewport |
| `ratio`     | `number`  | Intersection ratio (0.0 to 1.0)        |

## Examples

### Scroll animation

```angular-ts
import { Component, viewChild, ElementRef, computed } from '@angular/core';
import { elementVisibility } from '@signality/core';

@Component({
  template: `
    <section 
      #section 
      class="fade-section"
      [style.opacity]="opacity()"
      [style.transform]="transform()"
    >
      <h2>Animated Section</h2>
      <p>This fades in as you scroll</p>
    </section>
  `,
})
export class ScrollFadeIn {
  readonly section = viewChild<ElementRef>('section');
  readonly visibility = elementVisibility(this.section, {
    threshold: [0, 0.25, 0.5, 0.75, 1] // [!code highlight]
  });
  
  readonly opacity = computed(() => this.visibility().ratio);
  
  readonly transform = computed(() => {
    const ratio = this.visibility().ratio;
    const translateY = (1 - ratio) * 30;
    return `translateY(${translateY}px)`;
  });
}
```

### Infinite scroll trigger

```angular-ts
import { Component, viewChild, ElementRef, effect, signal } from '@angular/core';
import { elementVisibility } from '@signality/core';

@Component({
  template: `
    <div class="list">
      @for (item of items(); track item.id) {
        <div class="item">{{ item.name }}</div>
      }
    </div>
    
    <div #trigger class="load-trigger">
      @if (loading()) {
        <spinner />
      }
    </div>
  `,
})
export class InfiniteScroll {
  readonly trigger = viewChild<ElementRef>('trigger');
  readonly visibility = elementVisibility(this.trigger, {
    rootMargin: '100px' // load before reaching bottom
  });
  
  readonly items = signal<any[]>([]);
  readonly loading = signal(false);
  
  constructor() {
    effect(() => {
      if (this.visibility().isVisible && !this.loading()) {
        this.loadMore();
      }
    });
  }
  
  async loadMore() {
    this.loading.set(true);
    const newItems = await this.fetchItems();
    this.items.update(items => [...items, ...newItems]);
    this.loading.set(false);
  }
}
```

### Read progress tracking

```angular-ts
import { Component, viewChild, ElementRef, computed } from '@angular/core';
import { elementVisibility } from '@signality/core';

@Component({
  template: `
    <article #article>
      <h1>Long Article</h1>
      <p>Content...</p>
    </article>
    
    <div class="progress-bar">
      <div [style.width.%]="readProgress()"></div>
    </div>
  `,
})
export class ReadProgress {
  readonly article = viewChild<ElementRef>('article');
  readonly visibility = elementVisibility(this.article, {
    threshold: Array.from({ length: 101 }, (_, i) => i / 100)
  });
  
  readonly readProgress = computed(() => 
    Math.round(this.visibility().ratio * 100)
  );
}
```

### Scrollable container with reactive root

```angular-ts
import { Component, signal, viewChild, ElementRef } from '@angular/core';
import { elementVisibility } from '@signality/core';

@Component({
  template: `
    <div #container class="scroll-container">
      <div #section [class.visible]="visibility().isVisible">
        Section inside scrollable container
      </div>
    </div>
  `,
})
export class ScrollableContainer {
  readonly container = viewChild<ElementRef>('container');
  readonly section = viewChild<ElementRef>('section');
  
  // root element updates reactively when container becomes available
  readonly visibility = elementVisibility(this.section, {
    root: this.container, // [!code highlight]
    rootMargin: '50px',
  });
}
```

## SSR Compatibility

On the server, signals initialize with safe defaults:

- `isVisible` → `false`
- `ratio` → `0`

## Type Definitions

```typescript
interface ElementVisibilityValue {
  readonly isVisible: boolean;
  readonly ratio: number;
}

interface ElementVisibilityOptions
  extends CreateSignalOptions<ElementVisibilityValue>,
    WithInjector {
  readonly threshold?: MaybeSignal<number | number[]>;
  readonly root?: MaybeElementSignal<Element> | Document;
  readonly rootMargin?: MaybeSignal<string>;
}

function elementVisibility(
  target: MaybeElementSignal<HTMLElement>,
  options?: ElementVisibilityOptions
): Signal<ElementVisibilityValue>;
```

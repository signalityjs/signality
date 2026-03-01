---
source: https://github.com/signalityjs/signality/blob/main/projects/core/elements/scroll/index.ts
---

# Scroll

Reactive tracking of scroll position. Track scroll offset of window or any scrollable element.

<Demo name="scroll" />

## Usage

```angular-ts
import { Component } from '@angular/core';
import { scroll } from '@signality/core';

@Component({
  template: `
    <p>Scroll Y: {{ position.y() }}px</p>
  `,
})
export class ScrollDemo {
  readonly position = scroll(); // [!code highlight]
}
```

## Options

| Option     | Type                                                                                                | Default  | Description                          |
|------------|-----------------------------------------------------------------------------------------------------|----------|--------------------------------------|
| `target`   | [`MaybeElementSignal<Element>`](/reference/utility-types#maybeelementsignal-lt-type-gt) \| `Window` | `window` | Element or window to track scroll on |
| `throttle` | `number`                                                                                            | `0`      | Throttle scroll events (ms)          |
| `offset`   | `{ top?, bottom?, left?, right? }`                                                                  | `{}`     | Offset for arrived detection         |
| `injector` | [`Injector`](https://angular.dev/api/core/Injector)                                                 | -        | Optional injector for DI context     |

## Return Value

The `scroll()` function returns a `ScrollRef`:

| Property       | Type                       | Description                   |
|----------------|----------------------------|-------------------------------|
| `x`            | `Signal<number>`           | Horizontal scroll position    |
| `y`            | `Signal<number>`           | Vertical scroll position      |
| `isScrolling`  | `Signal<boolean>`          | Whether currently scrolling   |
| `arrivedState` | `Signal<ArrivedState>`     | Which edges have been reached |
| `directions`   | `Signal<ScrollDirections>` | Current scroll direction      |

```typescript
interface ArrivedState {
  top: boolean;
  bottom: boolean;
  left: boolean;
  right: boolean;
}

interface ScrollDirections {
  top: boolean;
  bottom: boolean;
  left: boolean;
  right: boolean;
}
```

## Examples

### Sticky header

```angular-ts
import { Component, computed } from '@angular/core';
import { scroll } from '@signality/core';

@Component({
  template: `
    <header [class.sticky]="isSticky()">
      <h1>My App</h1>
    </header>
    <main>Content...</main>
  `,
  styles: `
    header.sticky {
      position: fixed;
      top: 0;
      background: white;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
  `,
})
export class StickyHeader {
  readonly scroll = scroll();
  readonly isSticky = computed(() => this.scroll.y() > 100);
}
```

### Back to top button

```angular-ts
import { Component, computed } from '@angular/core';
import { scroll } from '@signality/core';

@Component({
  template: `
    @if (showButton()) {
      <button class="back-to-top" (click)="scrollToTop()">
        ↑ Top
      </button>
    }
  `,
})
export class BackToTop {
  readonly scroll = scroll();
  readonly showButton = computed(() => this.scroll.y() > 500);

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
```

### Scroll progress bar

```angular-ts
import { Component, computed } from '@angular/core';
import { scroll } from '@signality/core';

@Component({
  template: `
    <div class="progress-bar">
      <div class="progress" [style.width.%]="progress()"></div>
    </div>
  `,
})
export class ScrollProgress {
  readonly scroll = scroll();

  readonly progress = computed(() => {
    if (!window) return 0;
    const docEl = document.documentElement;
    const scrollHeight = docEl.scrollHeight - window.innerHeight;
    if (scrollHeight <= 0) return 0;
    return (this.scroll.y() / scrollHeight) * 100;
  });
}
```

### Infinite scroll

```angular-ts
import { Component, effect, signal } from '@angular/core';
import { scroll } from '@signality/core';

@Component({
  template: `
    <div class="list">
      @for (item of items(); track item.id) {
        <div class="item">{{ item.name }}</div>
      }
    </div>
    @if (loading()) {
      <div class="loading">Loading...</div>
    }
  `,
})
export class InfiniteList {
  readonly scrollPos = scroll({ offset: { bottom: 200 } });
  readonly items = signal<any[]>([]);
  readonly loading = signal(false);

  constructor() {
    effect(() => {
      if (this.scrollPos.arrivedState().bottom && !this.loading()) {
        this.loadMore(); // [!code highlight]
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

### Scrollable container

```angular-ts
import { Component, viewChild, ElementRef } from '@angular/core';
import { scroll } from '@signality/core';

@Component({
  template: `
    <div #container class="scroll-container">
      <div class="content">Long content...</div>
    </div>
    <div class="scroll-indicator">
      @if (!scroll.arrivedState().bottom) {
        <span>↓ Scroll for more</span>
      }
    </div>
  `,
})
export class ScrollContainer {
  readonly container = viewChild<ElementRef>('container');
  readonly scroll = scroll({ target: this.container }); // [!code highlight]
}
```

## SSR Compatibility

On the server, signals initialize with safe defaults:

- `x` → `0`
- `y` → `0`
- `isScrolling` → `false`
- `arrivedState` → `{ top: true, bottom: false, left: true, right: false }`
- `directions` → `{ top: false, bottom: false, left: false, right: false }`

## Type Definitions

```typescript
interface ArrivedState {
  top: boolean;
  bottom: boolean;
  left: boolean;
  right: boolean;
}

interface ScrollDirections {
  top: boolean;
  bottom: boolean;
  left: boolean;
  right: boolean;
}

interface ScrollOptions extends WithInjector {
  readonly target?: MaybeElementSignal<Element> | Window;
  readonly throttle?: number;
  readonly offset?: {
    readonly top?: number;
    readonly bottom?: number;
    readonly left?: number;
    readonly right?: number;
  };
}

interface ScrollRef {
  readonly x: Signal<number>;
  readonly y: Signal<number>;
  readonly isScrolling: Signal<boolean>;
  readonly arrivedState: Signal<ArrivedState>;
  readonly directions: Signal<ScrollDirections>;
}

function scroll(options?: ScrollOptions): ScrollRef;
```

## Related

- [Mouse](/elements/mouse) — Track mouse position
- [WindowSize](/elements/window-size) — Track window dimensions

---
source: https://github.com/signalityjs/signality/blob/main/projects/core/browser/media-query/index.ts
---

# MediaQuery

Reactive wrapper around [matchMedia](https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia). Track a single media query match state with Angular signals.

<Demo name="media-query" />

## Usage

```angular-ts
import { Component } from '@angular/core';
import { mediaQuery } from '@signality/core';

@Component({
  template: `
    <p>Dark mode: {{ prefersDark() ? 'Yes' : 'No' }}</p>
  `,
})
export class ThemeDetector {
  readonly prefersDark = mediaQuery('(prefers-color-scheme: dark)'); // [!code highlight]
}
```

## Parameters

| Parameter | Type                                                                     | Description                                                                                                                            |
|-----------|--------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------|
| `query`   | [`MaybeSignal<string>`](/reference/utility-types#maybesignal-lt-type-gt) | CSS media query string (see [Using media queries](https://developer.mozilla.org/en-US/docs/Web/CSS/Media_Queries/Using_media_queries)) |
| `options` | `MediaQueryOptions`                                                      | Optional configuration (see [Options](#options) below)                                                                                 |

## Options

The `MediaQueryOptions` extends Angular's [`CreateSignalOptions<boolean>`](https://angular.dev/api/core/CreateSignalOptions) and `WithInjector`:

| Option         | Type                                                | Description                                                                                                            |
|----------------|-----------------------------------------------------|------------------------------------------------------------------------------------------------------------------------|
| `initialValue` | `boolean`                                           | Initial value for SSR (default: `false`)                                                                               |
| `equal`        | `ValueEqualityFn<boolean>`                          | Custom equality function. See [Signal equality functions](https://angular.dev/guide/signals#signal-equality-functions) |
| `debugName`    | `string`                                            | Debug name for the signal (development only)                                                                           |
| `injector`     | [`Injector`](https://angular.dev/api/core/Injector) | Optional injector for DI context                                                                                       |

## Return Value

Returns a `Signal<boolean>` containing `true` when the media query matches, `false` otherwise.

## Examples

### Responsive component

```angular-ts
import { Component, computed } from '@angular/core';
import { mediaQuery } from '@signality/core';

@Component({
  template: `
    <nav [class]="navClass()">
      @if (isMobile()) {
        <button (click)="toggleMenu()">☰</button>
      }
      <ng-content />
    </nav>
  `,
})
export class ResponsiveNav {
  readonly isMobile = mediaQuery('(max-width: 768px)'); // [!code highlight]
  
  readonly navClass = computed(() => 
    this.isMobile() ? 'nav-mobile' : 'nav-desktop'
  );
  
  toggleMenu() {
    // Toggle mobile menu
  }
}
```

### Reduced motion

```angular-ts
import { Component, computed } from '@angular/core';
import { mediaQuery } from '@signality/core';

@Component({
  template: `
    <div [class]="animationClass()">
      <ng-content />
    </div>
  `,
})
export class AnimatedBox {
  readonly reducedMotion = mediaQuery('(prefers-reduced-motion: reduce)');
  
  readonly animationClass = computed(() => 
    this.reducedMotion() ? 'no-animation' : 'animated'
  );
}
```

### High contrast mode

```angular-ts
import { Component, effect, inject, DOCUMENT } from '@angular/core';
import { mediaQuery } from '@signality/core';

@Component({ /* ... */ })
export class AccessibilitySettings {
  readonly document = inject(DOCUMENT);
  readonly prefersHighContrast = mediaQuery('(prefers-contrast: more)');
  
  constructor() {
    effect(() => {
      if (this.prefersHighContrast()) {
        this.document.body.classList.add('high-contrast');
      } else {
        this.document.body.classList.remove('high-contrast');
      }
    });
  }
}
```

### Dynamic query

```angular-ts
import { Component, signal, computed } from '@angular/core';
import { mediaQuery } from '@signality/core';

@Component({
  template: `
    <input 
      type="number" 
      [value]="breakpoint()" 
      (input)="breakpoint.set(+$any($event.target).value)" 
    />
    <p>Matches: {{ matches() }}</p>
  `,
})
export class DynamicBreakpoint {
  readonly breakpoint = signal(768);
  readonly query = computed(() => `(min-width: ${this.breakpoint()}px)`); // [!code highlight]
  readonly matches = mediaQuery(this.query);
}
```

## SSR Compatibility

On the server, the signal initializes with `false` by default. You can provide an initial value:

```typescript
const isDark = mediaQuery('(prefers-color-scheme: dark)', {
  initialValue: true
});
```

## Type Definitions

```typescript
interface MediaQueryOptions extends CreateSignalOptions<boolean>, WithInjector {
  readonly initialValue?: boolean;
}

function mediaQuery(
  query: MaybeSignal<Union<MediaQueryFeature, string>>,
  options?: MediaQueryOptions
): Signal<boolean>;
```

## Related

- [Breakpoints](/browser/breakpoints) — Track multiple breakpoints at once

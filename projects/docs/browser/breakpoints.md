---
source: https://github.com/signalityjs/signality/blob/main/projects/core/browser/breakpoints/index.ts
---

# Breakpoints

Reactive breakpoint matching using [matchMedia](https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia). Track responsive breakpoints with Angular signals.

<Demo name="breakpoints" />

## Usage

```angular-ts
import { Component, computed } from '@angular/core';
import { breakpoints } from '@signality/core';

@Component({
  template: `
    <div [class]="layoutClass()">
      @if (bp.mobile()) {
        <mobile-nav />
      } @else {
        <desktop-nav />
      }
    </div>
  `,
})
export class ResponsiveLayout {
  readonly bp = breakpoints({
    mobile: '(max-width: 767px)',
    tablet: '(min-width: 768px) and (max-width: 1023px)',
    desktop: '(min-width: 1024px)',
  });
  
  readonly layoutClass = computed(() => {
    if (this.bp.mobile()) return 'layout-mobile';
    if (this.bp.tablet()) return 'layout-tablet';
    return 'layout-desktop';
  });
}
```

## Parameters

| Parameter | Type                     | Description                                            |
|-----------|--------------------------|--------------------------------------------------------|
| `map`     | `Record<string, string>` | Object mapping breakpoint names to media queries       |
| `options` | `BreakpointsOptions<T>`  | Optional configuration (see [Options](#options) below) |

## Options

The `BreakpointsOptions<T>` extends `WithInjector`:

| Option         | Type                                                | Default | Description                                |
|----------------|-----------------------------------------------------|---------|--------------------------------------------|
| `initialValue` | `Partial<Record<keyof T, boolean>>`                 | -       | Initial breakpoint values (useful for SSR) |
| `injector`     | [`Injector`](https://angular.dev/api/core/Injector) | -       | Optional injector for DI context           |

## Return Value

Returns an object with a signal for each breakpoint key, plus utility signals:

| Property  | Type               | Description                                  |
|-----------|--------------------|----------------------------------------------|
| `[key]`   | `Signal<boolean>`  | Whether the breakpoint matches               |
| `current` | `Signal<string[]>` | Array of currently matching breakpoint names |

## Examples

### Tailwind-style breakpoints

```angular-ts
import { Component, computed } from '@angular/core';
import { breakpoints } from '@signality/core';

const tailwindBreakpoints = {
  sm: '(min-width: 640px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)',
  xl: '(min-width: 1280px)',
  '2xl': '(min-width: 1536px)',
};

@Component({
  template: `
    <div [style.columns]="columns()">
      <ng-content />
    </div>
  `,
})
export class ResponsiveGrid {
  readonly bp = breakpoints(tailwindBreakpoints); // [!code highlight]
  
  readonly columns = computed(() => {
    if (this.bp['2xl']()) return 4;
    if (this.bp.xl()) return 3;
    if (this.bp.md()) return 2;
    return 1;
  });
}
```

### Show/hide elements

```angular-ts
import { Component } from '@angular/core';
import { breakpoints } from '@signality/core';

@Component({
  template: `
    @if (bp.desktop()) {
      <sidebar />
    }
    
    <main>
      <ng-content />
    </main>
    
    @if (bp.mobile()) {
      <bottom-nav />
    }
  `,
})
export class AppLayout {
  readonly bp = breakpoints({
    mobile: '(max-width: 767px)',
    desktop: '(min-width: 768px)',
  });
}
```

### Dynamic image loading

```angular-ts
import { Component, computed, input } from '@angular/core';
import { breakpoints } from '@signality/core';

@Component({
  selector: 'responsive-image',
  template: `<img [src]="imageSrc()" [alt]="alt()" />`,
})
export class ResponsiveImage {
  readonly src = input.required<string>();
  readonly alt = input('');
  
  readonly bp = breakpoints({
    small: '(max-width: 639px)',
    medium: '(min-width: 640px) and (max-width: 1023px)',
    large: '(min-width: 1024px)',
  });
  
  readonly imageSrc = computed(() => {
    const base = this.src();
    if (this.bp.small()) return base.replace('.jpg', '-sm.jpg');
    if (this.bp.medium()) return base.replace('.jpg', '-md.jpg');
    return base;
  });
}
```

## SSR Compatibility

On the server, all breakpoints initialize with `false` by default. You can provide initial values:

```typescript
const bp = breakpoints(
  { mobile: '(max-width: 767px)', desktop: '(min-width: 768px)' },
  { initialValue: { mobile: false, desktop: true } }
);
```

## Type Definitions

```typescript
interface BreakpointsOptions<T extends Record<string, string>> extends WithInjector {
  readonly initialValue?: Partial<Record<keyof T, boolean>>;
}

type BreakpointsRef<T extends Record<string, string>> = {
  readonly [K in keyof T]: Signal<boolean>;
} & {
  readonly current: Signal<(keyof T)[]>;
};

function breakpoints<T extends Record<string, string>>(
  breakpoints: T,
  options?: BreakpointsOptions<T>
): BreakpointsRef<T>;
```

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

### <svg xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle; margin-right: 5px; margin-bottom: 2px" width="21px" height="21px" viewBox="0 0 16 16" fill="none"><g clip-path="url(#clip0_2935_5892)"><path d="M8.00098 3.20117C5.8676 3.20117 4.53473 4.26742 4.00098 6.4008C4.80073 5.33442 5.73435 4.93455 6.80073 5.20117C7.4096 5.35292 7.84473 5.79442 8.3266 6.28367C9.11085 7.07955 10.0186 8.00092 12.001 8.00092C14.1342 8.00092 15.4672 6.93455 16.001 4.80067C15.201 5.86759 14.2677 6.26767 13.2011 6.00092C12.5924 5.84905 12.1577 5.40767 11.6752 4.91842C10.8915 4.12255 9.98398 3.20117 8.00098 3.20117ZM4.00098 8.00092C1.86773 8.00092 0.534727 9.0673 0.000976562 11.2012C0.800893 10.1343 1.73414 9.73417 2.80073 10.0009C3.4096 10.1528 3.84473 10.5942 4.3266 11.0834C5.11085 11.8793 6.0186 12.8007 8.00098 12.8007C10.1342 12.8007 11.4672 11.7344 12.001 9.60105C11.201 10.6675 10.2677 11.0673 9.2011 10.8007C8.59235 10.6489 8.15773 10.2074 7.67523 9.71817C6.89148 8.9223 5.98398 8.00092 4.00098 8.00092Z" fill="#38BDF8"/></g><defs><clipPath id="clip0_2935_5892"><rect width="16" height="16" fill="white"/></clipPath></defs></svg> Tailwind-style breakpoints

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

---
source: https://github.com/signalityjs/signality/blob/main/projects/cdk-interop/focus-monitor/index.ts
---

# FocusMonitor

Signal-based wrapper around Angular CDK's [FocusMonitor](https://material.angular.io/cdk/a11y/api#FocusMonitor). Reactively track focus state with focus origin detection (keyboard, mouse, touch, or program).

::: warning CDK Interop Package Required
This utility requires the `@signality/cdk-interop` and `@angular/cdk` packages to be installed:

```bash
npm install @signality/cdk-interop @angular/cdk
```

:::

## Usage

```angular-ts
import { Component, viewChild, ElementRef } from '@angular/core';
import { focusMonitor } from '@signality/cdk-interop';

@Component({
  template: `
    <button #btn [class.focused]="focus.isFocused()">
      Focus me!
    </button>
    <p>Focused: {{ focus.isFocused() }}</p>
    <p>Origin: {{ focus.origin() ?? 'none' }}</p>
  `,
})
export class FocusDemo {
  readonly btn = viewChild<ElementRef>('btn');
  readonly focus = focusMonitor(this.btn); // [!code highlight]
}
```

## Parameters

| Parameter | Type                                                                                        | Description                                            |
|-----------|---------------------------------------------------------------------------------------------|--------------------------------------------------------|
| `target`  | [`MaybeElementSignal<HTMLElement>`](/reference/utility-types#maybeelementsignal-lt-type-gt) | Target element to monitor                              |
| `options` | `FocusMonitorOptions`                                                                       | Optional configuration (see [Options](#options) below) |

## Options

| Option          | Type                                                | Default | Description                        |
|-----------------|-----------------------------------------------------|---------|------------------------------------|
| `checkChildren` | `boolean`                                           | `false` | Also monitor focus within children |
| `injector`      | [`Injector`](https://angular.dev/api/core/Injector) | -       | Optional injector for DI context   |

## Return Value

The `focusMonitor()` function returns a `FocusMonitorRef` object:

| Property    | Type                                                    | Description                                                              |
|-------------|---------------------------------------------------------|--------------------------------------------------------------------------|
| `isFocused` | `Signal<boolean>`                                       | Whether element is focused                                               |
| `origin`    | `Signal<FocusOrigin>`                                   | Focus origin: `'keyboard'`, `'mouse'`, `'touch'`, `'program'`, or `null` |
| `focusVia`  | `(origin: FocusOrigin, options?: FocusOptions) => void` | Focus element with specific origin                                       |

## Examples

### Focus origin analytics

```angular-ts
import { Component, viewChild, ElementRef, effect, inject } from '@angular/core';
import { focusMonitor } from '@signality/cdk-interop';
import { AnalyticsService } from './analytics.service';

@Component({
  template: `
    <button #cta>Sign Up Now</button>
  `,
})
export class CTAButton {
  readonly analytics = inject(AnalyticsService);
  readonly cta = viewChild<ElementRef>('cta');
  readonly fm = focusMonitor(this.cta);
  
  constructor() {
    effect(() => {
      const origin = this.fm.origin();
      if (origin) {
        this.analytics.track('cta_focus', { origin }); // [!code highlight]
      }
    });
  }
}
```

### Dialog focus management

```angular-ts
import { Component, viewChild, ElementRef, effect } from '@angular/core';
import { focusMonitor } from '@signality/cdk-interop';

@Component({
  template: `
    <dialog #dialog>
      <h2>Confirm Action</h2>
      <p>Are you sure?</p>
      <button #confirmBtn>Confirm</button>
      <button (click)="close()">Cancel</button>
    </dialog>
    <button (click)="open()">Open Dialog</button>
  `,
})
export class ConfirmDialog {
  readonly dialog = viewChild<ElementRef<HTMLDialogElement>>('dialog');
  readonly confirmBtn = viewChild<ElementRef<HTMLButtonElement>>('confirmBtn');
  readonly confirmFocus = focusMonitor(this.confirmBtn);
  
  open() {
    this.dialog()?.nativeElement.showModal();
    // Focus the confirm button with keyboard origin
    this.confirmFocus.focusVia('keyboard'); // [!code highlight]
  }
  
  close() {
    this.dialog()?.nativeElement.close();
  }
}
```

## Type Definitions

```typescript
interface FocusMonitorOptions extends WithInjector {
  readonly checkChildren?: boolean;
}

interface FocusMonitorRef {
  readonly isFocused: Signal<boolean>;
  readonly origin: Signal<FocusOrigin>;
  readonly focusVia: (origin: FocusOrigin, options?: FocusOptions) => void;
}

function focusMonitor(
  target: MaybeElementSignal<HTMLElement>,
  options?: FocusMonitorOptions
): FocusMonitorRef;
```

## Related

- [elementFocus](/elements/element-focus) — Basic focus tracking without CDK

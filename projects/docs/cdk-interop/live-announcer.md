---
source: https://github.com/signalityjs/signality/blob/main/projects/cdk-interop/live-announcer/index.ts
---

# LiveAnnouncer

Signal-based wrapper around Angular CDK's [LiveAnnouncer](https://material.angular.io/cdk/a11y/api#LiveAnnouncer). Reactively track and announce messages for screen readers.

::: warning CDK Interop Package Required
This utility requires the `@signality/cdk-interop` and `@angular/cdk` packages to be installed:

```bash
npm install @signality/cdk-interop @angular/cdk
```
:::

## Usage

```angular-ts
import { Component } from '@angular/core';
import { liveAnnouncer } from '@signality/cdk-interop';

@Component({
  template: `
    <button (click)="save()">Save</button>
    <p>Last announcement: {{ announcer.lastMessage() ?? 'none' }}</p>
  `,
})
export class SaveButton {
  readonly announcer = liveAnnouncer(); // [!code highlight]
  
  save() {
    this.announcer.announce('Document saved successfully');
  }
}
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `options` | `LiveAnnouncerOptions` | Optional configuration (see [Options](#options) below) |

## Options

The `LiveAnnouncerOptions` extends `WithInjector`:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `defaultPoliteness` | `'polite' \| 'assertive' \| 'off'` | `'polite'` | Default politeness level for announcements. See [ARIA live regions](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions#live_regions) |
| `injector` | [`Injector`](https://angular.dev/api/core/Injector) | - | Optional injector for DI context |

## Return Value

The `liveAnnouncer()` function returns a `LiveAnnouncerRef` object:

| Property | Type | Description |
|----------|------|-------------|
| `lastMessage` | `Signal<string \| null>` | Last announced message |
| `announce` | `(message: string, politeness?: AriaLivePoliteness) => void` | Announce a message to screen readers |
| `clear` | `() => void` | Clear all announcements |

## Examples

### Form validation feedback

```angular-ts
import { Component, effect } from '@angular/core';
import { liveAnnouncer } from '@signality/cdk-interop';

@Component({
  template: `
    <form>
      <input #email type="email" />
      <button type="submit">Submit</button>
    </form>
  `,
})
export class ContactForm {
  readonly announcer = liveAnnouncer();
  readonly email = viewChild<ElementRef>('email');
  
  onSubmit() {
    if (!this.email()?.nativeElement.validity.valid) {
      this.announcer.announce('Please enter a valid email', 'assertive'); // [!code highlight]
    }
  }
}
```

### Dynamic content updates

```angular-ts
import { Component, effect } from '@angular/core';
import { liveAnnouncer } from '@signality/cdk-interop';

@Component({
  template: `
    <button (click)="addItem()">Add Item</button>
    <p>Items: {{ items().length }}</p>
  `,
})
export class ShoppingCart {
  readonly announcer = liveAnnouncer();
  readonly items = signal<string[]>([]);
  
  addItem() {
    this.items.update(items => [...items, 'New item']);
    this.announcer.announce(`Item added. Total: ${this.items().length}`); // [!code highlight]
  }
}
```

### Navigation announcements

```angular-ts
import { Component, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { liveAnnouncer } from '@signality/cdk-interop';
import { routerListener } from '@signality/core';

@Component({
  template: `<router-outlet />`,
})
export class App {
  readonly announcer = liveAnnouncer();
  private router = inject(Router);
  
  constructor() {
    routerListener('navigationend', () => {
      const pageTitle = document.title || 'Page loaded';
      this.announcer.announce(`Navigated to ${pageTitle}`); // [!code highlight]
    });
  }
}
```

## Type Definitions

```typescript
type AriaLivePoliteness = 'polite' | 'assertive' | 'off';

interface LiveAnnouncerOptions extends WithInjector {
  readonly defaultPoliteness?: AriaLivePoliteness;
}

interface LiveAnnouncerRef {
  readonly lastMessage: Signal<string | null>;
  readonly announce: (message: string, politeness?: AriaLivePoliteness) => void;
  readonly clear: () => void;
}

function liveAnnouncer(options?: LiveAnnouncerOptions): LiveAnnouncerRef;
```

## Related

- [focusMonitor](/cdk-interop/focus-monitor) — Monitor focus state with origin detection
- [inputModality](/cdk-interop/input-modality) — Track current input method

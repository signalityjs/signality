---
source: https://github.com/signalityjs/signality/blob/main/projects/core/router/router-listener/index.ts
---

# RouterListener

Event-driven listener for Angular Router's [navigation lifecycle and events](https://angular.dev/guide/routing/lifecycle-and-events). Subscribe to specific router events with type-safe handlers.

## Usage

```angular-ts
import { Component } from '@angular/core';
import { routerListener } from '@signality/core';

@Component({
  template: `<router-outlet />`,
})
export class App {
  constructor() {
    routerListener('navigationstart', event => {
      console.log('Navigation started:', event.url); // [!code highlight]
    });
  }
}
```

## Parameters

| Parameter | Type                                            | Description                                                                                                                              |
|-----------|-------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------|
| `event`   | `RouterEventType \| readonly RouterEventType[]` | Router event name(s) in lowercase. Can be a single event or an array of events (see [Supported Events](#supported-events) below)         |
| `handler` | `(event: EventType) => void`                    | Type-safe handler function. For single event, receives the specific event type. For array of events, receives a union type of all events |
| `options` | `RouterListenerOptions`                         | Optional configuration (see [Options](#options) below)                                                                                   |

## Options

The `RouterListenerOptions` extends `WithInjector`:

| Option     | Type                                                | Default | Description                                                |
|------------|-----------------------------------------------------|---------|------------------------------------------------------------|
| `once`     | `boolean`                                           | `false` | If `true`, automatically unsubscribe after the first event |
| `injector` | [`Injector`](https://angular.dev/api/core/Injector) | -       | Optional injector for DI context                           |

## Return Value

Returns a `RouterListenerRef` object with the following method:

| Property  | Type         | Description                             |
|-----------|--------------|-----------------------------------------|
| `destroy` | `() => void` | Manually unsubscribe from router events |

## Supported Events

All Angular Router events are supported. Event names are in lowercase (camelCase):

| Event Type             | Event Class                                                                   | Description                                        |
|------------------------|-------------------------------------------------------------------------------|----------------------------------------------------|
| `navigationstart`      | [`NavigationStart`](https://angular.dev/api/router/NavigationStart)           | Occurs when navigation starts                      |
| `navigationend`        | [`NavigationEnd`](https://angular.dev/api/router/NavigationEnd)               | Occurs when navigation ends successfully           |
| `navigationcancel`     | [`NavigationCancel`](https://angular.dev/api/router/NavigationCancel)         | Occurs when navigation is cancelled                |
| `navigationerror`      | [`NavigationError`](https://angular.dev/api/router/NavigationError)           | Occurs when navigation fails                       |
| `navigationskipped`    | [`NavigationSkipped`](https://angular.dev/api/router/NavigationSkipped)       | Occurs when navigation is skipped                  |
| `routesrecognized`     | [`RoutesRecognized`](https://angular.dev/api/router/RoutesRecognized)         | Occurs when routes are recognized                  |
| `guardscheckstart`     | [`GuardsCheckStart`](https://angular.dev/api/router/GuardsCheckStart)         | Occurs at the start of guard phase                 |
| `guardscheckend`       | [`GuardsCheckEnd`](https://angular.dev/api/router/GuardsCheckEnd)             | Occurs at the end of guard phase                   |
| `resolvestart`         | [`ResolveStart`](https://angular.dev/api/router/ResolveStart)                 | Occurs at the start of resolve phase               |
| `resolveend`           | [`ResolveEnd`](https://angular.dev/api/router/ResolveEnd)                     | Occurs at the end of resolve phase                 |
| `routeconfigloadstart` | [`RouteConfigLoadStart`](https://angular.dev/api/router/RouteConfigLoadStart) | Occurs before lazy loading route configuration     |
| `routeconfigloadend`   | [`RouteConfigLoadEnd`](https://angular.dev/api/router/RouteConfigLoadEnd)     | Occurs after lazy-loaded route configuration loads |
| `childactivationstart` | [`ChildActivationStart`](https://angular.dev/api/router/ChildActivationStart) | Occurs at the start of child route activation      |
| `childactivationend`   | [`ChildActivationEnd`](https://angular.dev/api/router/ChildActivationEnd)     | Occurs at the end of child route activation        |
| `activationstart`      | [`ActivationStart`](https://angular.dev/api/router/ActivationStart)           | Occurs at the start of route activation            |
| `activationend`        | [`ActivationEnd`](https://angular.dev/api/router/ActivationEnd)               | Occurs at the end of route activation              |
| `scroll`               | [`Scroll`](https://angular.dev/api/router/Scroll)                             | Occurs during scrolling                            |

## Examples

### Loading indicator

```angular-ts
import { Component, signal } from '@angular/core';
import { routerListener } from '@signality/core';

@Component({
  selector: 'app-root',
  template: `
    @if (isLoading()) {
      <div class="loading-bar">Loading...</div>
    }
    <router-outlet />
  `,
})
export class App {
  readonly isLoading = signal(false);

  constructor() {
    routerListener('navigationstart', () => {
      this.isLoading.set(true);
    });

    // using array of events
    routerListener(['navigationend', 'navigationerror'], () => {
      this.isLoading.set(false);
    });
  }
}
```

### Analytics tracking

```angular-ts
import { Component, inject } from '@angular/core';
import { routerListener } from '@signality/core';
import { AnalyticsService } from './analytics.service';

@Component({ /* ... */ })
export class App {
  private analytics = inject(AnalyticsService);

  constructor() {
    routerListener('navigationend', event => {
      this.analytics.trackPageView(event.urlAfterRedirects); // [!code highlight]
    });
  }
}
```

### Error handling

```angular-ts
import { Component, signal } from '@angular/core';
import { routerListener } from '@signality/core';

@Component({
  template: `
    @if (error(); as error) {
      <div class="error-banner">
        <p>Navigation error: {{ error.message }}</p>
        <button (click)="dismissError()">Dismiss</button>
      </div>
    }
    <router-outlet />
  `,
})
export class App {
  readonly error = signal<Error | null>(null);

  constructor() {
    routerListener('navigationerror', event => {
      this.error.set(event.error); // [!code highlight]
    });
  }

  dismissError() {
    this.error.set(null);
  }
}
```

### Guard rejection tracking

```angular-ts
import { Component } from '@angular/core';
import { routerListener } from '@signality/core';

@Component({ /* ... */ })
export class App {
  constructor() {
    routerListener('navigationcancel', event => {
      if (event.code === NavigationCancellationCode.GuardRejected) {
        console.warn('Navigation cancelled by guard:', event.reason);
      }
    });
  }
}
```

### Route resolution tracking

```angular-ts
import { Component } from '@angular/core';
import { routerListener } from '@signality/core';

@Component({ /* ... */ })
export class App {
  constructor() {
    routerListener('resolvestart', event => {
      console.log('Resolving data for:', event.urlAfterRedirects);
    });

    routerListener('resolveend', event => {
      console.log('Data resolved for:', event.urlAfterRedirects);
    });
  }
}
```

### One-time listener

```angular-ts
import { Component } from '@angular/core';
import { routerListener } from '@signality/core';

@Component({ /* ... */ })
export class App {
  constructor() {
    // automatically unsubscribe after first navigation
    routerListener('navigationstart', event => {
      console.log('First navigation:', event.url);
    }, { once: true }); // [!code highlight]
  }
}
```

## Type Definitions

```typescript
type RouterEventType =
  | 'navigationstart'
  | 'navigationend'
  | 'navigationcancel'
  | 'navigationerror'
  | 'navigationskipped'
  | 'routesrecognized'
  | 'guardscheckstart'
  | 'guardscheckend'
  | 'resolvestart'
  | 'resolveend'
  | 'routeconfigloadstart'
  | 'routeconfigloadend'
  | 'childactivationstart'
  | 'childactivationend'
  | 'activationstart'
  | 'activationend'
  | 'scroll';

interface RouterListenerOptions extends WithInjector {
  /** If true, automatically unsubscribe after the first event */
  readonly once?: boolean;
}

interface RouterListenerRef {
  /** Manually unsubscribe from router events */
  readonly destroy: () => void;
}

// Overloads for type-safe handlers (single event)
function routerListener(
  event: 'navigationstart',
  handler: (event: NavigationStart) => void,
  options?: RouterListenerOptions
): RouterListenerRef;
// ... (overloads for all event types)

// Overload for multiple events with union type
function routerListener<T extends readonly [RouterEventType, ...RouterEventType[]]>(
  events: T,
  handler: (event: RouterEventTypeArrayToUnion<T>) => void,
  options?: RouterListenerOptions
): RouterListenerRef;
```

## Related

- [params](/router/params) — Access route parameters
- [queryParams](/router/query-params) — Access query parameters
- [fragment](/router/fragment) — Access URL fragment
- [url](/router/url) — Access current URL
- [routeData](/router/route-data) — Access route data

---
source: https://github.com/signalityjs/signality/blob/main/projects/core/router/url/index.ts
---

# Url

Reactive wrapper around Angular Router's [current URL](https://angular.dev/api/router/Router#url). Access the full URL as a signal.

## Usage

```angular-ts
import { Component } from '@angular/core';
import { url } from '@signality/core';

@Component({
  template: `
    <p>Current URL: {{ currentUrl() }}</p>
  `,
})
export class SharePage {
  readonly currentUrl = url(); // [!code highlight]
}
```

## Parameters

| Parameter | Type         | Description                                            |
|-----------|--------------|--------------------------------------------------------|
| `options` | `UrlOptions` | Optional configuration (see [Options](#options) below) |

## Options

The `UrlOptions` extends [`CreateSignalOptions<string>`](https://angular.dev/api/core/CreateSignalOptions) and `WithInjector`:

| Option      | Type                      | Default | Description                                                                                                            |
|-------------|---------------------------|---------|------------------------------------------------------------------------------------------------------------------------|
| `absolute`  | `boolean`                 | `false` | Include origin (protocol + host)                                                                                       |
| `equal`     | [`ValueEqualityFn<string>`](https://angular.dev/api/core/ValueEqualityFn) | -       | Custom equality function ([see more](https://angular.dev/guide/signals#signal-equality-functions)) |
| `debugName` | `string`                  | -       | Debug name for the signal                                                                                              |
| `injector`  | [`Injector`](https://angular.dev/api/core/Injector)                | -       | Optional injector for DI context                                                                                       |

## Return Value

Returns a `Signal<string>` containing the current URL.

## Examples

### Analytics tracking

```angular-ts
import { Component, effect, inject } from '@angular/core';
import { url } from '@signality/core';
import { AnalyticsService } from './analytics.service';

@Component({ /* ... */ })
export class App {
  readonly analytics = inject(AnalyticsService);
  readonly currentUrl = url();
  
  constructor() {
    effect(() => {
      this.analytics.trackPageView(this.currentUrl()); // [!code highlight]
    });
  }
}
```

### Social share

```angular-ts
import { Component, computed } from '@angular/core';
import { url } from '@signality/core';

@Component({
  template: `
    <div class="share-buttons">
      <a [href]="xUrl()" target="_blank">Share on X</a>
    </div>
  `,
})
export class ShareButtons {
  readonly currentUrl = url({ absolute: true });
  
  readonly xUrl = computed(() => 
    `https://x.com/intent/tweet?url=${encodeURIComponent(this.currentUrl())}`
  );
}
```

## SSR Compatibility

On the server, the signal initializes with the current URL from the router's [`url`](https://angular.dev/api/router/Router#url) property.

## Type Definitions

```typescript
interface UrlOptions extends CreateSignalOptions<string>, WithInjector {
  readonly absolute?: boolean;
}

function url(options?: UrlOptions): Signal<string>;
```

## Related

- [params](/router/params) — Access route parameters
- [queryParams](/router/query-params) — Access query parameters
- [fragment](/router/fragment) — Access URL fragment

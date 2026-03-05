---
source: https://github.com/signalityjs/signality/blob/main/projects/core/browser/page-visibility/index.ts
---

# PageVisibility

Reactive wrapper around the [Page Visibility API](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API). Returns a signal that tracks the current visibility state of the page.

<Demo name="page-visibility" />

## Usage

```angular-ts
import { Component, effect } from '@angular/core';
import { pageVisibility } from '@signality/core';

@Component({
  template: `
    <p>Page is {{ visibility() === 'visible' ? 'visible' : 'hidden' }}</p>
  `,
})
export class VisibilityDemo {
  readonly visibility = pageVisibility(); // [!code highlight]
  
  constructor() {
    effect(() => {
      if (this.visibility() === 'hidden') {
        console.log('User switched tabs');
      }
    });
  }
}
```

::: warning Use InjectionToken for Singleton
For global state tracking like `pageVisibility`, consider using the provided `PAGE_VISIBILITY` token instead of calling the function directly. This provides a singleton instance that can be shared across your entire application, reducing memory usage and event listener overhead:

```typescript
import { inject } from '@angular/core';
import { PAGE_VISIBILITY } from '@signality/core';

const visibility = pageVisibility(); // [!code --]
const visibility = inject(PAGE_VISIBILITY); // [!code ++]
```

Learn more about [Token-based utilities](/guide/key-concepts#token-based-utilities).
:::

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `options` | `PageVisibilityOptions` | Optional configuration (see [Options](#options) below) |

## Options

The `PageVisibilityOptions` extends [`CreateSignalOptions<DocumentVisibilityState>`](https://angular.dev/api/core/CreateSignalOptions) and `WithInjector`:

| Option      | Type                                    | Description                                    |
|-------------|-----------------------------------------|------------------------------------------------|
| `equal`     | [`ValueEqualityFn<DocumentVisibilityState>`](https://angular.dev/api/core/ValueEqualityFn) | Custom equality function ([see more](https://angular.dev/guide/signals#signal-equality-functions)) |
| `debugName` | `string`                                | Debug name for the signal (development only)   |
| `injector`  | [`Injector`](https://angular.dev/api/core/Injector)                              | Optional injector for DI context               |

## Return Value

Returns a `Signal<DocumentVisibilityState>` containing the current page visibility state. Possible values:
- `'visible'` - The page content is at least partially visible
- `'hidden'` - The page content is not visible to the user

## Examples

### Pause video when hidden

```angular-ts
import { Component, viewChild, effect, ElementRef } from '@angular/core';
import { pageVisibility } from '@signality/core';

@Component({
  template: `<video #video src="video.mp4" autoplay></video>`,
})
export class SmartVideo {
  readonly video = viewChild.required<ElementRef<HTMLVideoElement>>('video');
  readonly visibility = pageVisibility();
  
  constructor() {
    effect(() => {
      const videoEl = this.video().nativeElement;
      if (this.visibility() === 'visible') {
        videoEl.play();
      } else {
        videoEl.pause();
      }
    });
  }
}
```

## SSR Compatibility

On the server, the signal initializes with `'visible'`.

## Type Definitions

```typescript
type PageVisibilityOptions = CreateSignalOptions<DocumentVisibilityState> & WithInjector;

function pageVisibility(options?: PageVisibilityOptions): Signal<DocumentVisibilityState>;
```

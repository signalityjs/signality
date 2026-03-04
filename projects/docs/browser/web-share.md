---
source: https://github.com/signalityjs/signality/blob/main/projects/core/browser/web-share/index.ts
---

# WebShare

Reactive wrapper around the [Web Share API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API). Share content using the native share dialog with Angular signals.

::: warning Secure Context Required
This feature is available only in [secure contexts](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Secure_Contexts) (HTTPS) or potentially trustworthy origins (such as `localhost` or `127.0.0.1`). Regular `http://` URLs will not work in most browsers.
:::

<Demo name="web-share" />

## Usage

```angular-ts
import { Component } from '@angular/core';
import { webShare, title, url } from '@signality/core';

@Component({
  template: `
    @if (shareApi.isSupported()) {
      <button (click)="shareContent()">Share</button>
    }
  `,
})
export class WebShareDemo {
  readonly webShare = webShare(); // [!code highlight]
  readonly title = title();
  readonly url = url({ absolute: true });
  
  async shareContent() {
    await this.webShare.share({
      title: this.title() ?? 'Check this out!',
      text: 'Amazing content from our app',
      url: this.url(),
    });
  }
}
```

## Return Value

The `webShare()` function returns a `WebShareRef` object:

| Property      | Type                                 | Description                            |
|---------------|--------------------------------------|----------------------------------------|
| `isSupported` | `Signal<boolean>`                    | Whether Web Share API is supported     |
| `isSharing`   | `Signal<boolean>`                    | Whether share dialog is currently open |
| `share`       | `(data: ShareData) => Promise<void>` | Open native share dialog               |
| `canShare`    | `(data?: ShareData) => boolean`      | Check if data can be shared            |

## Examples

### Share with files

```angular-ts
import { Component, signal } from '@angular/core';
import { webShare } from '@signality/core';

@Component({
  template: `
    <input type="file" (change)="onFileSelect($event)" accept="image/*" />
    
    @if (selectedFile() && webShare.canShare({ files: [selectedFile()!] })) {
      <button (click)="shareImage()">Share Image</button>
    }
  `,
})
export class ImageShare {
  readonly webShare = webShare();
  readonly selectedFile = signal<File | null>(null);
  
  onFileSelect(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    this.selectedFile.set(file ?? null);
  }
  
  async shareImage() {
    const file = this.selectedFile();
    if (!file) return;
    
    await this.webShare.share({
      files: [file], // [!code highlight]
      title: 'Check out this image!',
    });
  }
}
```

### Social share fallback

```angular-ts
import { Component, computed } from '@angular/core';
import { webShare, title, url } from '@signality/core';

@Component({
  selector: 'social-share',
  template: `
    @if (webShare.isSupported()) {
      <button (click)="nativeShare()">Share</button>
    } @else {
      <div class="social-buttons">
        <a target="_blank">Twitter</a>
        <a target="_blank">Facebook</a>
        <a target="_blank">LinkedIn</a>
      </div>
    }
  `,
})
export class SocialShare {
  readonly webShare = webShare();
  readonly title = title();
  readonly url = url({ absolute: true });

  async nativeShare() {
    await this.webShare.share({
      title: this.title() ?? '', // [!code highlight]
      url: this.url(), // [!code highlight]
    });
  }
}
```

## Share Data

The [`ShareData`](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share#shareData) object supports:

| Property | Type     | Description                            |
|----------|----------|----------------------------------------|
| `title`  | `string` | Share title                            |
| `text`   | `string` | Share text/description                 |
| `url`    | `string` | URL to share                           |
| `files`  | `File[]` | Files to share (requires user gesture) |

## SSR Compatibility

On the server, signals initialize with safe defaults:

- `isSupported` → `false`
- `isSharing` → `false`
- `share` → no-op async function
- `canShare` → returns `false`

## Browser Compatibility

The Web Share API has limited browser support, primarily on mobile devices. Always check `isSupported()` before using the share functionality (see [Browser API support detection](/guide/key-concepts#browser-api-support-detection)):

```angular-html
@if (webShare.isSupported()) {
  <button (click)="webShare.share({ title: 'Title', text: 'Text' })">Share</button>
} @else {
  <p>Sharing is not available in this browser</p>
}
```

For detailed browser support information, see [Can I use: Web Share API](https://caniuse.com/web-share).

## Type Definitions

```typescript
interface WebShareRef {
  readonly isSupported: Signal<boolean>;
  readonly isSharing: Signal<boolean>;
  readonly share: (data: ShareData) => Promise<void>;
  readonly canShare: (data?: ShareData) => boolean;
}

function webShare(options?: WithInjector): WebShareRef;
```

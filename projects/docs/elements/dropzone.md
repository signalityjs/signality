---
source: https://github.com/signalityjs/signality/blob/main/projects/core/elements/dropzone/index.ts
---

# Dropzone

Reactive wrapper around the [Drag and Drop API](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API). Create file drop zones with Angular signals.

<Demo name="dropzone" />

## Usage

```angular-ts
import { Component, viewChild, ElementRef } from '@angular/core';
import { dropzone } from '@signality/core';

@Component({
  template: `
    <div 
      #zone 
      class="dropzone" 
      [class.over]="drop.isOver()"
    >
      @if (drop.files().length > 0) {
        <p>{{ drop.files().length }} file(s) dropped</p>
      } @else {
        <p>Drop files here</p>
      }
    </div>
  `,
})
export class DropzoneDemo {
  readonly zone = viewChild<ElementRef>('zone');
  readonly drop = dropzone(this.zone); // [!code highlight]
}
```

## Parameters

| Parameter | Type                                                                                        | Description                                            |
|-----------|---------------------------------------------------------------------------------------------|--------------------------------------------------------|
| `target`  | [`MaybeElementSignal<HTMLElement>`](/reference/utility-types#maybeelementsignal-lt-type-gt) | Drop zone element                                      |
| `options` | `DropzoneOptions`                                                                           | Optional configuration (see [Options](#options) below) |

## Options

| Option                | Type                                                                       | Default | Description                                                                                        |
|-----------------------|----------------------------------------------------------------------------|---------|----------------------------------------------------------------------------------------------------|
| `accept`              | [`MaybeSignal<string[]>`](/reference/utility-types#maybesignal-lt-type-gt) | `['*']` | Accepted [MIME types](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types) |
| `multiple`            | [`MaybeSignal<boolean>`](/reference/utility-types#maybesignal-lt-type-gt)  | `true`  | Allow multiple files                                                                               |
| `preventDocumentDrop` | `boolean`                                                                  | `true`  | Prevent drops outside zone                                                                         |
| `injector`            | [`Injector`](https://angular.dev/api/core/Injector)                        | -       | Optional injector for DI context                                                                   |

## Return Value

The `dropzone()` function returns a `DropzoneRef`:

| Property     | Type                   | Description                     |
|--------------|------------------------|---------------------------------|
| `isOver`     | `Signal<boolean>`     | Whether dragging over the zone  |
| `files`      | `WritableSignal<File[]>` | Dropped files (writable)      |
| `isDragging` | `Signal<boolean>`     | Whether any drag is in progress |

## Examples

### Image upload

```angular-ts
import { Component, viewChild, ElementRef, computed } from '@angular/core';
import { dropzone } from '@signality/core';

@Component({
  template: `
    <div 
      #zone 
      class="image-dropzone"
      [class.dragover]="drop.isOver()"
    >
      @if (previewUrl()) {
        <img [src]="previewUrl()" alt="Preview" />
      } @else {
        <p>📷 Drop an image here</p>
      }
    </div>
  `,
})
export class ImageUpload {
  readonly zone = viewChild<ElementRef>('zone');
  readonly drop = dropzone(this.zone, {
    accept: ['image/jpeg', 'image/png', 'image/gif'], // [!code highlight]
    multiple: false,
  });
  
  readonly previewUrl = computed(() => {
    const files = this.drop.files();
    if (files.length === 0) return null;
    return URL.createObjectURL(files[0]);
  });
}
```

### Multi-file upload

```angular-ts
import { Component, viewChild, ElementRef, signal, computed } from '@angular/core';
import { dropzone } from '@signality/core';

interface UploadedFile {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'done' | 'error';
}

@Component({
  template: `
    <div #zone class="dropzone" [class.over]="drop.isOver()">
      <p>Drop files to upload</p>
    </div>
    
    <div class="file-list">
      @for (item of uploads(); track item.file.name) {
        <div class="file-item">
          <span>{{ item.file.name }}</span>
          <progress [value]="item.progress" max="100"></progress>
          <span>{{ item.status }}</span>
        </div>
      }
    </div>
  `,
})
export class MultiUpload {
  readonly zone = viewChild<ElementRef>('zone');
  readonly drop = dropzone(this.zone);
  readonly uploads = signal<UploadedFile[]>([]);
  
  constructor() {
    effect(() => {
      const files = this.drop.files();
      if (files.length > 0) {
        this.handleFiles(files); // [!code highlight]
      }
    });
  }
  
  private handleFiles(files: File[]) {
    const newUploads = files.map(file => ({
      file,
      progress: 0,
      status: 'pending' as const,
    }));
    
    this.uploads.update(u => [...u, ...newUploads]);
    
    newUploads.forEach(item => this.uploadFile(item));
  }
  
  private async uploadFile(item: UploadedFile) {
    // Upload logic
  }
}
```

## SSR Compatibility

On the server, signals initialize with safe defaults:

- `isOver` → `false`
- `files` → `[]`
- `isDragging` → `false`

## Type Definitions

```typescript
interface DropzoneOptions extends WithInjector {
  readonly accept?: MaybeSignal<string[]>;
  readonly multiple?: MaybeSignal<boolean>;
  readonly preventDocumentDrop?: boolean;
}

interface DropzoneRef {
  readonly isOver: Signal<boolean>;
  readonly files: WritableSignal<File[]>;
  readonly isDragging: Signal<boolean>;
}

function dropzone(
  target: MaybeElementSignal<HTMLElement>,
  options?: DropzoneOptions
): DropzoneRef;
```

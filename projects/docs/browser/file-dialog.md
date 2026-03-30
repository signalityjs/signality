---
source: https://github.com/signalityjs/signality/blob/main/projects/core/browser/file-dialog/index.ts
---

# FileDialog

Signal-based utility for programmatically opening the native file picker dialog.

<Demo name="file-dialog" />

## Usage

```angular-ts
import { Component } from '@angular/core';
import { fileDialog } from '@signality/core';

@Component({
  template: `
    <button (click)="fd.open()">Select Files</button>

    @for (file of fd.files(); track file.name) {
      <p>{{ file.name }} ({{ file.size }} bytes)</p>
    }

    @if (fd.files().length) {
      <button (click)="fd.files.set([])">Clear</button>
    }
  `,
})
export class FileUploadComponent {
  readonly fd = fileDialog({ accept: 'image/*' }); // [!code highlight]
}
```

## Parameters

| Param       | Type                                                                      | Default | Description                                                                                                                                                              |
|-------------|---------------------------------------------------------------------------|---------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `multiple`  | [`MaybeSignal<boolean>`](/reference/utility-types#maybesignal-lt-type-gt) | `true`  | Whether to allow selecting multiple files                                                                                                                                |
| `accept`    | [`MaybeSignal<string>`](/reference/utility-types#maybesignal-lt-type-gt)  | `'*'`   | Comma-separated accepted file types (MIME types, wildcards, or extensions) — see [accept](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/accept) |
| `capture`   | [`MaybeSignal<string>`](/reference/utility-types#maybesignal-lt-type-gt)  | —       | Mobile capture source: `'user'` or `'environment'` — see [capture](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/capture)                                 |
| `directory` | [`MaybeSignal<boolean>`](/reference/utility-types#maybesignal-lt-type-gt) | `false` | Select directories instead of files — see [webkitdirectory](https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/webkitdirectory)                           |
| `validator` | `(file: File) => boolean`                                                 | —       | Custom per-file validation predicate. When provided, `accept` only affects native browser filtering, not per-file validation                                             |
| `onReject`  | `(files: File[]) => void`                                                 | —       | Callback invoked with rejected files after selection                                                                                                                     |
| `injector`  | [`Injector`](https://angular.dev/api/core/Injector)                       | —       | Optional injector for DI context                                                                                                                                         |

## Return Value

The `fileDialog()` function returns a `FileDialogRef` object:

| Property | Type                     | Description                               |
|----------|--------------------------|-------------------------------------------|
| `files`  | `WritableSignal<File[]>` | Selected files. Reset via `files.set([])` |
| `open`   | `() => void`             | Open the file picker dialog               |

## Examples

### Image picker

```angular-ts
import { Component } from '@angular/core';
import { fileDialog } from '@signality/core';

@Component({
  template: `
    <button (click)="fd.open()">Pick Images</button>
    <p>{{ fd.files().length }} image(s) selected</p>
  `,
})
export class ImagePicker {
  readonly fd = fileDialog({ accept: 'image/*', multiple: true });
}
```

### Single file selection

```angular-ts
import { Component } from '@angular/core';
import { fileDialog } from '@signality/core';

@Component({
  template: `
    <button (click)="fd.open()">Upload PDF</button>
    @if (fd.files().length) {
      <p>Selected: {{ fd.files()[0].name }}</p>
    }
  `,
})
export class PdfUpload {
  readonly fd = fileDialog({ accept: '.pdf', multiple: false });
}
```

### Directory selection

> **Note:** The `directory` option uses the [webkitdirectory](https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/webkitdirectory) attribute, widely supported across all modern browsers.

```angular-ts
import { Component } from '@angular/core';
import { fileDialog } from '@signality/core';

@Component({
  template: `
    <button (click)="fd.open()">Select Folder</button>
    <p>{{ fd.files().length }} file(s) in folder</p>
  `,
})
export class FolderPicker {
  readonly fd = fileDialog({ directory: true });
}
```

### File size validation with rejection feedback

```angular-ts
import { Component, signal } from '@angular/core';
import { fileDialog } from '@signality/core';

@Component({
  template: `
    <button (click)="fd.open()">Upload Files</button>
    <p>Max 5 MB each</p>

    @for (msg of errors(); track msg) {
      <p class="error">{{ msg }}</p>
    }
  `,
})
export class ValidatedUpload {
  readonly errors = signal<string[]>([]);

  readonly fd = fileDialog({
    validator: (file) => file.size <= 5 * 1024 * 1024, // [!code highlight]
    onReject: (rejected) => { // [!code highlight]
      this.errors.set(rejected.map(f => `${f.name} exceeds 5 MB`)); // [!code highlight]
    }, // [!code highlight]
  });
}
```

## SSR Compatibility

On the server, signals initialize with safe defaults:

- `files` → empty `File[]` array
- `open` → no-op function

## Type Definitions

```typescript
interface FileDialogOptions extends WithInjector {
  readonly multiple?: MaybeSignal<boolean>;
  readonly accept?: MaybeSignal<string>;
  readonly capture?: MaybeSignal<string>;
  readonly directory?: MaybeSignal<boolean>;
  readonly validator?: (file: File) => boolean;
  readonly onReject?: (files: File[]) => void;
}

interface FileDialogRef {
  readonly files: WritableSignal<File[]>;
  readonly open: () => void;
}

function fileDialog(options?: FileDialogOptions): FileDialogRef;
```

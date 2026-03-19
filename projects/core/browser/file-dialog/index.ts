import { isSignal, type Signal, signal, untracked, type WritableSignal } from '@angular/core';
import { isAcceptedFile, NOOP_FN, setupContext, toValue } from '@signality/core/internal';
import type { MaybeSignal, WithInjector } from '@signality/core/types';
import { watcher } from '@signality/core/reactivity/watcher';

export interface FileDialogOptions extends WithInjector {
  /**
   * Whether to allow selecting multiple files.
   * When changed reactively, the current file list is re-filtered.
   * @default true
   */
  readonly multiple?: MaybeSignal<boolean>;

  /**
   * Comma-separated list of accepted file types, matching the native HTML
   * [`accept`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/accept) attribute format.
   * Supports MIME types (`'image/png'`), wildcards (`'image/*'`), and file extensions (`'.pdf'`).
   * When changed reactively, the current file list is re-filtered.
   *
   * @default '*'
   * @see [accept attribute on MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/accept)
   */
  readonly accept?: MaybeSignal<string>;

  /**
   * Capture source for mobile devices: `'user'` (front camera) or `'environment'` (rear camera).
   * @see [capture attribute on MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/capture)
   */
  readonly capture?: MaybeSignal<string>;

  /**
   * Whether to select directories instead of files.
   * Uses the non-standard `webkitdirectory` attribute.
   * @default false
   */
  readonly directory?: MaybeSignal<boolean>;

  /**
   * Custom validation predicate called for each selected file.
   * Return `true` to keep the file, `false` to reject it.
   *
   * When provided, the `accept` option is ignored — the validator
   * takes full responsibility for deciding which files are valid.
   *
   * @example
   * ```typescript
   * fileDialog({
   *   validator: (file) => file.size <= 5 * 1024 * 1024, // max 5 MB
   * });
   * ```
   */
  readonly validator?: (file: File) => boolean;

  /**
   * Callback invoked with files that were rejected during selection.
   * Useful for showing toast notifications or validation errors.
   *
   * @example
   * ```typescript
   * fileDialog({
   *   accept: 'image/*',
   *   onReject: (rejected) => {
   *     rejected.forEach(f => toast.error(`${f.name} is not valid`));
   *   },
   * });
   * ```
   */
  readonly onReject?: (files: File[]) => void;
}

export interface FileDialogRef {
  /**
   * List of files selected via the file dialog.
   * A `WritableSignal` — can be reset externally (e.g. `files.set([])`).
   * Re-filtered automatically when `accept` or `multiple` options change reactively.
   *
   * @see [File API on MDN](https://developer.mozilla.org/en-US/docs/Web/API/File)
   */
  readonly files: WritableSignal<File[]>;

  /**
   * Open the native file picker dialog.
   */
  readonly open: () => void;
}

/**
 * Signal-based utility for programmatically opening the native file picker dialog.
 *
 * @param options - Optional configuration
 * @returns A {@link FileDialogRef} with `files` signal and `open` method
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     <button (click)="fd.open()">Select Files</button>
 *     @for (file of fd.files(); track file.name) {
 *       <p>{{ file.name }} ({{ file.size }} bytes)</p>
 *     }
 *   `
 * })
 * export class FileUpload {
 *   readonly fd = fileDialog({ accept: 'image/*' });
 * }
 * ```
 */
export function fileDialog(options?: FileDialogOptions): FileDialogRef {
  const { runInContext } = setupContext(options?.injector, fileDialog);

  return runInContext(({ isBrowser }) => {
    if (!isBrowser) {
      return {
        files: signal<File[]>([]),
        open: NOOP_FN,
      };
    }

    const accept = options?.accept ?? '*';
    const multiple = options?.multiple ?? true;
    const capture = options?.capture ?? '';
    const directory = options?.directory ?? false;
    const validatorFn = options?.validator;
    const onReject = options?.onReject;

    const files = signal<File[]>([]);

    let inputEl: HTMLInputElement | null = null;

    const processFiles = (raw: File[]) => {
      const accepted: File[] = [];
      const rejected: File[] = [];
      const acceptValue = toValue(accept);
      const multipleValue = toValue(multiple);

      const isAccepted = validatorFn
        ? validatorFn
        : (file: File) => isAcceptedFile(file, acceptValue);

      for (const file of raw) {
        if (isAccepted(file)) {
          accepted.push(file);
          if (!multipleValue) {
            break;
          }
        } else {
          rejected.push(file);
        }
      }

      if (onReject && rejected.length > 0) {
        onReject(rejected);
      }

      files.set(accepted);
    };

    const createInput = (): HTMLInputElement => {
      const el = document.createElement('input');
      el.type = 'file';
      el.onchange = e => {
        const fileList = (e.currentTarget as HTMLInputElement).files;
        processFiles(fileList ? Array.from(fileList) : []);
      };
      return el;
    };

    const open = (): void => {
      untracked(() => {
        inputEl ??= createInput();

        inputEl.value = '';
        inputEl.multiple = toValue(multiple);
        inputEl.accept = toValue(accept);

        const directoriesOnly = toValue(directory);
        if (directoriesOnly) {
          inputEl.webkitdirectory = true;
        }

        const captureValue = toValue(capture);
        if (captureValue) {
          inputEl.capture = captureValue;
        }

        inputEl.click();
      });
    };

    const filters = [accept, multiple, validatorFn].filter(isSignal) as Signal<any>[];

    if (filters.length) {
      watcher(filters, () => processFiles(files()));
    }

    return {
      files,
      open,
    };
  });
}

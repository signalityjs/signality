import { isSignal, type Signal, signal, type WritableSignal } from '@angular/core';
import { constSignal, isAcceptedFile, isNodeWithin, setupContext } from '@signality/core/internal';
import { toElement, toValue } from '@signality/core/utilities';
import type { MaybeElementSignal, MaybeSignal, WithInjector } from '@signality/core/types';
import { listener } from '@signality/core/browser/listener';
import { onDisconnect } from '@signality/core/elements/on-disconnect';
import { watcher } from '@signality/core/reactivity/watcher';

export interface DropzoneOptions extends WithInjector {
  /**
   * Comma-separated list of accepted file types, matching the native HTML
   * [`accept`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/accept) attribute format.
   * Supports MIME types (`'image/png'`), wildcards (`'image/*'`), and file extensions (`'.pdf'`).
   * Use `'*'` to accept all file types.
   *
   * @default '*'
   * @see [accept attribute on MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/accept)
   */
  readonly accept?: MaybeSignal<string>;

  /**
   * Whether to allow dropping multiple files at once.
   * When `false`, only the first accepted file is kept.
   *
   * @default true
   */
  readonly multiple?: MaybeSignal<boolean>;

  /**
   * When `true`, prevents files from being dropped anywhere outside the drop zone
   * by intercepting `dragover` and `drop` events on the document.
   *
   * @default true
   */
  readonly preventDocumentDrop?: boolean;

  /**
   * Custom validation predicate called for each dropped file.
   * Return `true` to keep the file, `false` to reject it.
   *
   * When provided, the `accept` option is ignored — the validator
   * takes full responsibility for deciding which files are valid.
   *
   * @example
   * ```typescript
   * dropzone(target, {
   *   validator: (file) => file.size <= 5 * 1024 * 1024, // max 5 MB
   * });
   * ```
   */
  readonly validator?: (file: File) => boolean;

  /**
   * Callback invoked with files that were rejected during a drop.
   * Called once per drop with the full array of rejected files.
   * Useful for showing toast notifications or validation errors.
   *
   * @example
   * ```typescript
   * dropzone(target, {
   *   accept: 'image/*',
   *   onReject: (rejected) => {
   *     rejected.forEach(f => toast.error(`${f.name} is not an image`));
   *   },
   * });
   * ```
   */
  readonly onReject?: (files: File[]) => void;
}

export interface DropzoneRef {
  /**
   * List of files dropped onto the zone, filtered by `accept` and `multiple`.
   * A `WritableSignal` — can be reset externally (e.g. after upload).
   *
   * @see [DataTransfer.files on MDN](https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer/files)
   */
  readonly files: WritableSignal<File[]>;

  /**
   * Whether the user is currently dragging over the drop zone.
   */
  readonly isOver: Signal<boolean>;

  /**
   * Whether any drag operation is in progress anywhere on the document.
   * Useful for showing a global drop overlay.
   */
  readonly isDragging: Signal<boolean>;
}

/**
 * Signal-based wrapper around the [HTML Drag and Drop API](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API).
 *
 * @param target - Drop zone element
 * @param options - Optional configuration
 * @returns An object with isOver, files, data, and isDragging signals
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     <div
 *       #zone
 *       [class.over]="drop.isOver()"
 *       [class.dragging]="drop.isDragging()"
 *     >
 *       Drop files here
 *       @if (drop.files().length > 0) {
 *         <ul>
 *           @for (file of drop.files(); track file.name) {
 *             <li>{{ file.name }} ({{ file.size }} bytes)</li>
 *           }
 *         </ul>
 *       }
 *     </div>
 *   `
 * })
 * export class DropzoneDemo {
 *   readonly zone = viewChild<ElementRef>('zone');
 *   readonly drop = dropzone(this.zone, { accept: 'image/*', multiple: true });
 * }
 * ```
 */
export function dropzone(
  target: MaybeElementSignal<HTMLElement>,
  options?: DropzoneOptions
): DropzoneRef {
  const { runInContext } = setupContext(options?.injector, dropzone);

  return runInContext(({ isServer }) => {
    if (isServer) {
      return {
        files: signal([]),
        isOver: constSignal(false),
        isDragging: constSignal(false),
      };
    }

    const accept = options?.accept ?? '*';
    const multiple = options?.multiple ?? true;
    const preventDocumentDrop = options?.preventDocumentDrop ?? true;
    const validatorFn = options?.validator;
    const onReject = options?.onReject;

    const files = signal<File[]>([]);
    const isOver = signal(false);
    const isDragging = signal(false);

    let dragCounter = 0;

    const processFiles = (files: File[]): File[] => {
      const accepted: File[] = [];
      const rejected: File[] = [];
      const acceptValue = toValue(accept);
      const multipleValue = toValue(multiple);

      const isAccepted = validatorFn
        ? validatorFn
        : (file: File) => isAcceptedFile(file, acceptValue);

      for (const file of files) {
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

      return accepted;
    };

    listener.prevent.capture(target, 'dragenter', () => {
      dragCounter++;
      isOver.set(true);
    });

    listener.prevent.capture(target, 'dragleave', () => {
      dragCounter--;
      if (dragCounter === 0) {
        isOver.set(false);
      }
    });

    listener.prevent.capture(target, 'dragover', (e: DragEvent) => {
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'copy';
      }
    });

    listener.prevent.stop.capture(target, 'drop', (e: DragEvent) => {
      dragCounter = 0;
      isOver.set(false);
      isDragging.set(false);

      if (e.dataTransfer && e.dataTransfer.files.length > 0) {
        const arr = Array.from(e.dataTransfer.files);
        files.set(processFiles(arr));
      }
    });

    listener.capture(document, 'dragenter', () => {
      isDragging.set(true);
    });

    listener.capture(document, 'dragleave', (e: DragEvent) => {
      if (e.relatedTarget === null) {
        isDragging.set(false);
      }
    });

    listener.capture(document, 'drop', () => {
      isDragging.set(false);
    });

    if (preventDocumentDrop) {
      listener.capture(document, 'dragover', (e: DragEvent) => {
        const el = toElement(target);

        if (el && !isNodeWithin(e.target as Node, el)) {
          e.preventDefault();
          if (e.dataTransfer) {
            e.dataTransfer.dropEffect = 'none';
          }
        }
      });

      listener.capture(document, 'drop', (e: DragEvent) => {
        const el = toElement(target);

        if (el && !isNodeWithin(e.target as Node, el)) {
          e.preventDefault();
        }
      });
    }

    const filters = [accept, multiple].filter(isSignal) as Signal<any>[];

    if (filters.length) {
      watcher(filters, () => files.update(processFiles));
    }

    onDisconnect(target, () => {
      files.set([]);
      isOver.set(false);
      isDragging.set(false);
    });

    return {
      files,
      isOver: isOver.asReadonly(),
      isDragging: isDragging.asReadonly(),
    };
  });
}

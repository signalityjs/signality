import { isSignal, type Signal, signal } from '@angular/core';
import { constSignal, setupContext, toElement, toValue } from '@signality/core/internal';
import type { MaybeElementSignal, MaybeSignal, WithInjector } from '@signality/core/types';
import { listener } from '@signality/core/browser/listener';
import { onDisconnect } from '@signality/core/elements/on-disconnect';
import { watcher } from '@signality/core/reactivity/watcher';

export interface DropzoneOptions extends WithInjector {
  /**
   * Accepted MIME types.
   * @default ['*']
   */
  readonly accept?: MaybeSignal<string[]>;

  /**
   * Allow multiple files.
   * @default true
   */
  readonly multiple?: MaybeSignal<boolean>;

  /**
   * Prevent drops outside the zone.
   * @default true
   */
  readonly preventDocumentDrop?: boolean;
}

export interface DropzoneRef {
  /** Dropped files */
  readonly files: Signal<File[]>;

  /** Whether dragging over the zone */
  readonly isOver: Signal<boolean>;

  /** Whether any drag is in progress (document-wide) */
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
 * class DropzoneComponent {
 *   readonly zone = viewChild<ElementRef>('zone');
 *   readonly drop = dropzone(this.zone, { accept: ['image/*'], multiple: true });
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
        files: constSignal([]),
        isOver: constSignal(false),
        isDragging: constSignal(false),
      };
    }

    const accept = options?.accept ?? ['*'];
    const multiple = options?.multiple ?? true;
    const preventDocumentDrop = options?.preventDocumentDrop ?? true;

    const files = signal<File[]>([]);
    const isOver = signal(false);
    const isDragging = signal(false);

    let dragCounter = 0;

    const isAcceptedType = (file: File): boolean => {
      const acceptTypes = toValue(accept);

      if (acceptTypes.includes('*')) {
        return true;
      }

      return acceptTypes.some(type => {
        if (type.endsWith('/*')) {
          const prefix = type.slice(0, -1);
          return file.type.startsWith(prefix);
        }
        return file.type === type;
      });
    };

    const filterFiles = (files: File[]): File[] => {
      const isMultiple = toValue(multiple);
      const result: File[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (isAcceptedType(file)) {
          result.push(file);
          if (!isMultiple) {
            break;
          }
        }
      }

      return result;
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

      if (e.dataTransfer) {
        if (e.dataTransfer.files.length > 0) {
          const filtered = filterFiles(Array.from(e.dataTransfer.files));
          files.set(filtered);
        }
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
        if (el) {
          const targetNode = e.target as Node;

          const isWithinDropzone =
            el === targetNode ||
            el.contains(targetNode) ||
            (el.shadowRoot && el.shadowRoot.contains(targetNode));

          if (!isWithinDropzone) {
            e.preventDefault();
            if (e.dataTransfer) {
              e.dataTransfer.dropEffect = 'none';
            }
          }
        }
      });

      listener.capture(document, 'drop', (e: DragEvent) => {
        const el = toElement(target);
        if (el) {
          const targetNode = e.target as Node;

          const isWithinDropzone =
            el === targetNode ||
            el.contains(targetNode) ||
            (el.shadowRoot && el.shadowRoot.contains(targetNode));

          if (!isWithinDropzone) {
            e.preventDefault();
          }
        }
      });
    }

    const filters = [accept, multiple].filter(isSignal) as Signal<any>[];

    if (filters.length) {
      watcher(filters, () => files.update(filterFiles));
    }

    onDisconnect(target, () => {
      files.set([]);
      isOver.set(false);
      isDragging.set(false);
    });

    return {
      files: files.asReadonly(),
      isOver: isOver.asReadonly(),
      isDragging: isDragging.asReadonly(),
    };
  });
}

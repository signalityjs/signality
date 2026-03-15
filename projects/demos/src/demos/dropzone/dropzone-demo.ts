import { ChangeDetectionStrategy, Component, computed, viewChild } from '@angular/core';
import { dropzone } from '@signality/core/elements/dropzone';
import { DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-dropzone',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard],
  template: `
    <ng-demo-wrapper [demoPath]="'dropzone/dropzone-demo'" [code]="importCode">
      <demo-card>
        <!-- Drop zone -->
        <div
          #dropZone
          class="dz-zone"
          [class.dz-zone--dragging]="dz.isDragging() && !dz.isOver()"
          [class.dz-zone--over]="dz.isOver()"
          [class.dz-zone--filled]="dz.files().length > 0 && !dz.isOver()"
        >
          @if (dz.files().length === 0) {
          <!-- Upload icon -->
          <svg
            class="dz-icon"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="16 16 12 12 8 16" />
            <line x1="12" y1="12" x2="12" y2="21" />
            <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
          </svg>
          <span class="dz-hint">
            {{
              dz.isOver() ? 'Release to drop' : dz.isDragging() ? 'Drag here…' : 'Drop files here'
            }}
          </span>
          } @else {
          <!-- File list -->
          <div class="dz-files">
            @for (file of dz.files(); track file.name) {
            <div class="dz-file">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <span class="dz-file-name">{{ file.name }}</span>
              <span class="dz-file-size">{{ formatSize(file.size) }}</span>
            </div>
            }
          </div>
          }
        </div>

        <!-- Divider -->
        <div class="dz-divider"></div>

        <!-- Footer -->
        <div class="dz-footer">
          <span
            class="dz-status"
            [class.dz-status--dragging]="dz.isDragging()"
            [class.dz-status--filled]="dz.files().length > 0 && !dz.isDragging()"
          >
            <span
              class="dz-dot"
              [class.dz-dot--amber]="dz.isOver()"
              [class.dz-dot--success]="dz.files().length > 0 && !dz.isOver()"
            ></span>
            {{ statusLabel() }}
          </span>
          @if (dz.files().length > 0) {
          <button class="dz-clear" (click)="dz.files.set([])">Clear</button>
          }
        </div>
      </demo-card>
    </ng-demo-wrapper>
  `,
  styles: `
    /* ── Drop zone ── */
    .dz-zone {
      min-height: 96px;
      border: 1px dashed #27272a;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 1rem;
      transition: border-color 0.2s ease, background 0.2s ease;
    }

    .dz-zone--dragging {
      border-color: #3f3f46;
    }

    .dz-zone--over {
      border-color: rgba(245, 158, 11, 0.45);
      background: rgba(245, 158, 11, 0.04);
    }

    .dz-zone--filled {
      border-color: rgba(34, 197, 94, 0.3);
      background: rgba(34, 197, 94, 0.03);
      align-items: flex-start;
      justify-content: flex-start;
    }

    /* ── Upload icon ── */
    .dz-icon {
      color: #3f3f46;
      transition: color 0.2s ease;
    }

    .dz-zone--over .dz-icon { color: #f59e0b; }
    .dz-zone--dragging .dz-icon { color: #52525b; }

    /* ── Hint text ── */
    .dz-hint {
      font-size: 0.8125rem;
      color: #52525b;
      transition: color 0.2s ease;
    }

    .dz-zone--over .dz-hint { color: #f59e0b; }
    .dz-zone--dragging .dz-hint { color: #71717a; }

    /* ── File list ── */
    .dz-files {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
      width: 100%;
    }

    .dz-file {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.375rem 0.5rem;
      background: rgba(34, 197, 94, 0.06);
      border-radius: 5px;
      color: #52525b;
    }

    .dz-file-name {
      font-size: 0.8125rem;
      color: #a1a1aa;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      flex: 1;
      min-width: 0;
    }

    .dz-file-size {
      font-size: 0.75rem;
      color: #52525b;
      flex-shrink: 0;
    }

    /* ── Divider ── */
    .dz-divider {
      height: 1px;
      background: #1f1f22;
      margin: 0.875rem 0 0;
    }

    /* ── Footer ── */
    .dz-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 0.75rem;
    }

    .dz-status {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8125rem;
      color: #52525b;
      transition: color 0.2s ease;
    }

    .dz-status--dragging { color: #a1a1aa; }
    .dz-status--filled   { color: #a1a1aa; }

    /* ── Status dot ── */
    .dz-dot {
      position: relative;
      width: 6px;
      height: 6px;
      flex-shrink: 0;
    }

    .dz-dot::before,
    .dz-dot::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: #3f3f46;
      transition: background 0.2s ease;
    }

    .dz-dot--amber::before,
    .dz-dot--amber::after { background: #f59e0b; }

    .dz-dot--amber::after {
      animation: dzPulse 1.2s ease-out infinite;
    }

    .dz-dot--success::before,
    .dz-dot--success::after { background: #22c55e; }

    .dz-dot--success::after {
      animation: dzPulse 2s ease-out infinite;
    }

    @keyframes dzPulse {
      0%   { transform: scale(1); opacity: 0.6; }
      100% { transform: scale(3); opacity: 0; }
    }

    /* ── Clear button ── */
    .dz-clear {
      font-size: 0.8125rem;
      font-family: inherit;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
      color: #52525b;
      transition: color 0.15s ease;
    }

    .dz-clear:hover { color: #a1a1aa; }
  `,
})
export class DropzoneDemo {
  readonly dropZone = viewChild<HTMLElement>('dropZone');
  readonly dz = dropzone(this.dropZone);

  readonly importCode = `import { dropzone } from '@signality/core'`;

  readonly statusLabel = computed(() => {
    if (this.dz.isOver()) return 'Drop here!';
    const count = this.dz.files().length;
    if (count > 0) return count === 1 ? '1 file' : `${count} files`;
    if (this.dz.isDragging()) return 'Dragging…';
    return 'Waiting';
  });

  formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
}

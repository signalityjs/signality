import { ChangeDetectionStrategy, Component, ViewEncapsulation, viewChild } from '@angular/core';
import { dropzone } from '@signality/core/elements/dropzone';
import { DemoBadge, DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-dropzone',
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard, DemoBadge],
  template: `
    <ng-demo-wrapper [code]="importCode">
      <div class="dropzone-demo">
        <div
          #dropZone
          class="drop-zone"
          [class.over]="dz.isOver()"
          [class.has-files]="dz.files().length > 0"
        >
          @if (dz.files().length === 0) {
          <span class="drop-hint">Drop files here</span>
          } @else {
          <div class="files-list">
            @for (file of dz.files(); track file.name) {
            <div class="file-item">
              <span class="file-name">{{ file.name }}</span>
              <span class="file-size">{{ formatSize(file.size) }}</span>
            </div>
            }
          </div>
          }
        </div>

        <demo-card>
          <div class="status-row">
            <span class="status-label">Status</span>
            <demo-badge
              [type]="dz.isOver() ? 'warning' : dz.files().length > 0 ? 'success' : 'neutral'"
            >
              {{ dz.isOver() ? 'Drop!' : dz.files().length > 0 ? 'Files dropped' : 'Waiting' }}
            </demo-badge>
          </div>
        </demo-card>
      </div>
    </ng-demo-wrapper>
  `,
  styles: `
    .dropzone-demo {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .drop-zone {
      min-height: 100px;
      background: #161618;
      border: 1px dashed #3f3f46;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      transition: all 0.2s ease;
    }

    .drop-zone.over {
      border-color: #f59e0b;
      background: rgba(245, 158, 11, 0.1);
    }

    .drop-zone.has-files {
      border-color: #22c55e;
      background: rgba(34, 197, 94, 0.05);
      align-items: flex-start;
      justify-content: flex-start;
    }

    .drop-hint {
      font-size: 0.875rem;
      color: #71717a;
    }

    .files-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      width: 100%;
    }

    .file-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem;
      background: #27272a;
      border-radius: 4px;
    }

    .file-name {
      font-size: 0.75rem;
      color: #e4e4e7;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .file-size {
      font-size: 0.625rem;
      color: #71717a;
    }

    .status-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .status-label {
      font-size: 0.875rem;
      font-weight: 500;
      color: #a1a1aa;
    }
  `,
})
export class DropzoneDemo {
  readonly dropZone = viewChild<HTMLElement>('dropZone');
  readonly dz = dropzone(this.dropZone);

  readonly importCode = `import { dropzone } from '@signality/core'`;

  formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
}

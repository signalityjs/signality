import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { elementSize } from '@signality/core/elements/element-size';
import { DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-element-size',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard],
  template: `
    <ng-demo-wrapper [demoPath]="'element-size/element-size-demo'" [code]="importCode">
      <demo-card>
        <!-- Resizable zone -->
        <div #resizable class="es-zone">
          <svg
            class="es-resize-icon"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="15 3 21 3 21 9" />
            <polyline points="9 21 3 21 3 15" />
            <line x1="21" y1="3" x2="14" y2="10" />
            <line x1="3" y1="21" x2="10" y2="14" />
          </svg>
          Resize me
        </div>

        <!-- Divider -->
        <div class="es-divider"></div>

        <!-- Info rows -->
        <div class="es-rows">
          <div class="es-row">
            <span class="es-label">Width</span>
            <span class="es-value">{{ size().width }}px</span>
          </div>
          <div class="es-row">
            <span class="es-label">Height</span>
            <span class="es-value">{{ size().height }}px</span>
          </div>
        </div>
      </demo-card>
    </ng-demo-wrapper>
  `,
  styles: `
    /* ── Resizable zone ── */
    .es-zone {
      height: 80px;
      border: 1px dashed #27272a;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      font-size: 0.8125rem;
      color: #52525b;
      resize: both;
      overflow: hidden;
      min-width: 120px;
      min-height: 60px;
      cursor: se-resize;
      user-select: none;
    }

    /* ── Resize icon ── */
    .es-resize-icon {
      flex-shrink: 0;
      color: #3f3f46;
    }

    /* ── Divider ── */
    .es-divider {
      height: 1px;
      background: #1f1f22;
      margin: 0.875rem 0 0;
    }

    /* ── Info rows ── */
    .es-rows {
      display: flex;
      flex-direction: column;
      padding-top: 0.75rem;
    }

    .es-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.375rem 0;
    }

    .es-row + .es-row {
      border-top: 1px solid #1f1f22;
    }

    .es-label {
      font-size: 0.8125rem;
      color: #71717a;
    }

    .es-value {
      font-size: 0.8125rem;
      color: #a1a1aa;
      font-variant-numeric: tabular-nums;
    }
  `,
})
export class ElementSizeDemo {
  readonly resizable = viewChild<HTMLElement>('resizable');
  readonly size = elementSize(this.resizable);

  readonly importCode = `import { elementSize } from '@signality/core'`;
}

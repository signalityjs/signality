import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { resizeObserver } from '@signality/core/observers/resize-observer';
import { DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-resize-observer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard],
  template: `
    <ng-demo-wrapper [demoPath]="'resize-observer/resize-observer-demo'" [code]="importCode">
      <demo-card>
        <!-- Resizable zone -->
        <div #resizable class="ro-zone">
          <svg
            class="ro-resize-icon"
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
        <div class="ro-divider"></div>

        <!-- Info rows -->
        <div class="ro-rows">
          <div class="ro-row">
            <span class="ro-label">Width</span>
            <span class="ro-value">{{ size().width.toFixed(0) }}px</span>
          </div>
          <div class="ro-row">
            <span class="ro-label">Height</span>
            <span class="ro-value">{{ size().height.toFixed(0) }}px</span>
          </div>
        </div>
      </demo-card>
    </ng-demo-wrapper>
  `,
  styles: `
    /* ── Resizable zone ── */
    .ro-zone {
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
    .ro-resize-icon {
      flex-shrink: 0;
      color: #3f3f46;
    }

    /* ── Divider ── */
    .ro-divider {
      height: 1px;
      background: #1f1f22;
      margin: 0.875rem 0 0;
    }

    /* ── Info rows ── */
    .ro-rows {
      display: flex;
      flex-direction: column;
      padding-top: 0.75rem;
    }

    .ro-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.375rem 0;
    }

    .ro-row + .ro-row {
      border-top: 1px solid #1f1f22;
    }

    .ro-label {
      font-size: 0.8125rem;
      color: #71717a;
    }

    .ro-value {
      font-size: 0.8125rem;
      color: #a1a1aa;
      font-variant-numeric: tabular-nums;
    }
  `,
})
export class ResizeObserverDemo {
  readonly resizable = viewChild<HTMLElement>('resizable');
  readonly size = signal({ width: 0, height: 0 });

  readonly importCode = `import { resizeObserver } from '@signality/core'`;

  constructor() {
    resizeObserver(this.resizable, entries => {
      const { width, height } = entries[0].contentRect;
      this.size.set({ width, height });
    });
  }
}

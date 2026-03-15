import { ChangeDetectionStrategy, Component } from '@angular/core';
import { windowSize } from '@signality/core/elements/window-size';
import { DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-window-size',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard],
  template: `
    <ng-demo-wrapper [demoPath]="'window-size/window-size-demo'" [code]="importCode">
      <demo-card>
        <!-- Info rows -->
        <div class="ws-rows">
          <div class="ws-row">
            <span class="ws-label">Width</span>
            <span class="ws-value">{{ size().width }}px</span>
          </div>
          <div class="ws-row">
            <span class="ws-label">Height</span>
            <span class="ws-value">{{ size().height }}px</span>
          </div>
          <div class="ws-row">
            <span class="ws-label">Inner</span>
            <span class="ws-value">{{ size().innerWidth }} × {{ size().innerHeight }}</span>
          </div>
          <div class="ws-row">
            <span class="ws-label">Outer</span>
            <span class="ws-value">{{ size().outerWidth }} × {{ size().outerHeight }}</span>
          </div>
        </div>
      </demo-card>
    </ng-demo-wrapper>
  `,
  styles: `
    /* ── Info rows ── */
    .ws-rows {
      display: flex;
      flex-direction: column;
    }

    .ws-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.375rem 0;
    }

    .ws-row + .ws-row {
      border-top: 1px solid #1f1f22;
    }

    .ws-label {
      font-size: 0.8125rem;
      color: #71717a;
    }

    .ws-value {
      font-size: 0.8125rem;
      color: #a1a1aa;
      font-variant-numeric: tabular-nums;
    }
  `,
})
export class WindowSizeDemo {
  readonly size = windowSize();

  readonly importCode = `import { windowSize } from '@signality/core'`;
}

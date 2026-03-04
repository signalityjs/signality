import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { windowSize } from '@signality/core/elements/window-size';
import { DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-window-size',
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard],
  template: `
    <ng-demo-wrapper [code]="importCode">
      <div class="size-card">
        <demo-card>
          <div class="size-grid">
            <div class="size-item">
              <span class="size-label">Width</span>
              <span class="size-value">{{ size().width }}px</span>
            </div>
            <div class="size-item">
              <span class="size-label">Height</span>
              <span class="size-value">{{ size().height }}px</span>
            </div>
          </div>
        </demo-card>

        <demo-card>
          <div class="size-details">
            <div class="detail-row">
              <span class="detail-label">inner</span>
              <span class="detail-value">{{ size().innerWidth }} × {{ size().innerHeight }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">outer</span>
              <span class="detail-value">{{ size().outerWidth }} × {{ size().outerHeight }}</span>
            </div>
          </div>
        </demo-card>
      </div>
    </ng-demo-wrapper>
  `,
  styles: `
    .size-card {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .size-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .size-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .size-label {
      font-size: 0.75rem;
      font-weight: 500;
      color: #a1a1aa;
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }

    .size-value {
      font-size: 1.5rem;
      font-weight: 600;
      color: #e4e4e7;
    }

    .size-details {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .detail-label {
      font-size: 0.75rem;
      font-weight: 500;
      color: #a1a1aa;
      text-transform: uppercase;
    }

    .detail-value {
      font-size: 0.875rem;
      color: #e4e4e7;
      font-variant-numeric: tabular-nums;
    }
  `,
})
export class WindowSizeDemo {
  readonly size = windowSize();

  readonly importCode = `import { windowSize } from '@signality/core'`;
}

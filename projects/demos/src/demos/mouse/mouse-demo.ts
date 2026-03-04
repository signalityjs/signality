import { ChangeDetectionStrategy, Component, ViewEncapsulation, signal } from '@angular/core';
import { mouse, type MouseCoordinateType } from '@signality/core/elements/mouse';
import { DemoCard, DemoToggle, Wrapper } from '../../common';

@Component({
  selector: 'demo-mouse',
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard, DemoToggle],
  template: `
    <ng-demo-wrapper [code]="importCode">
      <div class="mouse-card">
        <demo-card>
          <div class="type-row">
            <span class="type-label">Coordinate Type</span>
            <demo-toggle [options]="coordinateOptions" [value]="coordinateType" />
          </div>
        </demo-card>

        <div class="tracking-area">
          <span class="tracking-hint">Move your mouse here</span>
        </div>

        <demo-card>
          <div class="coords-grid">
            <div class="coord-item">
              <span class="coord-label">X</span>
              <span class="coord-value">{{ position().x }}</span>
            </div>
            <div class="coord-item">
              <span class="coord-label">Y</span>
              <span class="coord-value">{{ position().y }}</span>
            </div>
          </div>
        </demo-card>
      </div>
    </ng-demo-wrapper>
  `,
  styles: `
    .mouse-card {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .type-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }

    .type-label {
      font-size: 0.875rem;
      font-weight: 500;
      color: #a1a1aa;
    }

    .tracking-area {
      position: relative;
      height: 120px;
      background: #161618;
      border: 1px dashed #3f3f46;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: crosshair;
    }

    .tracking-hint {
      font-size: 0.875rem;
      color: #71717a;
    }

    .coords-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .coord-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .coord-label {
      font-size: 0.75rem;
      font-weight: 500;
      color: #a1a1aa;
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }

    .coord-value {
      font-size: 1.25rem;
      font-weight: 600;
      color: #e4e4e7;
      font-variant-numeric: tabular-nums;
    }
  `,
})
export class MouseDemo {
  readonly coordinateType = signal<MouseCoordinateType>('page');
  readonly position = mouse({ type: 'page' });

  readonly coordinateOptions = [
    { label: 'page', value: 'page' as MouseCoordinateType },
    { label: 'client', value: 'client' as MouseCoordinateType },
    { label: 'screen', value: 'screen' as MouseCoordinateType },
  ];

  readonly importCode = `import { mouse } from '@signality/core'`;
}

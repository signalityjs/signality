import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { swipe } from '@signality/core/elements/swipe';
import { DemoBadge, DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-swipe',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard, DemoBadge],
  template: `
    <ng-demo-wrapper [code]="importCode">
      <div class="swipe-demo">
        <div #swipeArea class="swipe-area" [class.swiping]="sw.isSwiping()">
          <span class="swipe-hint">Swipe here (touch device)</span>
        </div>

        <demo-card>
          <div class="status-row">
            <span class="status-label">Direction</span>
            <demo-badge [type]="getDirectionType()">
              {{ sw.direction() }}
            </demo-badge>
          </div>
        </demo-card>

        <demo-card>
          <div class="coords-grid">
            <div class="coord-item">
              <span class="coord-label">X</span>
              <span class="coord-value">{{ sw.distanceX() }}px</span>
            </div>
            <div class="coord-item">
              <span class="coord-label">Y</span>
              <span class="coord-value">{{ sw.distanceY() }}px</span>
            </div>
          </div>
        </demo-card>
      </div>
    </ng-demo-wrapper>
  `,
  styles: `
    .swipe-demo {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .swipe-area {
      height: 100px;
      background: #161618;
      border: 1px dashed #3f3f46;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      touch-action: none;
    }

    .swipe-area.swiping {
      border-color: #DEB3EB;
      background: rgba(222, 179, 235, 0.1);
    }

    .swipe-hint {
      font-size: 0.875rem;
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
    }

    .coord-value {
      font-size: 0.875rem;
      color: #e4e4e7;
    }
  `,
})
export class SwipeDemo {
  readonly swipeArea = viewChild<HTMLElement>('swipeArea');
  readonly sw = swipe(this.swipeArea);

  readonly importCode = `import { swipe } from '@signality/core'`;

  getDirectionType(): 'success' | 'warning' | 'info' | 'neutral' {
    const dir = this.sw.direction();
    if (dir === 'none') return 'neutral';
    return 'info';
  }
}

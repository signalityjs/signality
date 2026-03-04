import { ChangeDetectionStrategy, Component, ViewEncapsulation, viewChild } from '@angular/core';
import { elementVisibility } from '@signality/core/elements/element-visibility';
import { DemoCard, DemoProgress, Wrapper } from '../../common';

@Component({
  selector: 'demo-element-visibility',
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard, DemoProgress],
  template: `
    <ng-demo-wrapper [code]="importCode">
      <div class="visibility-demo">
        <div #target class="target-box" [class.visible]="visibility().isVisible">
          <span class="target-text">{{ visibility().isVisible ? 'Visible' : 'Hidden' }}</span>
        </div>

        <demo-card>
          <div class="status-row">
            <span class="status-label">Status</span>
            <span class="status-value" [class.visible]="visibility().isVisible">
              {{ visibility().isVisible ? 'Visible' : 'Hidden' }}
            </span>
          </div>
        </demo-card>

        <demo-card>
          <demo-progress
            [value]="visibility().ratio * 100"
            [color]="visibility().isVisible ? '#22c55e' : '#71717a'"
            [showValue]="true"
          />
        </demo-card>
      </div>
    </ng-demo-wrapper>
  `,
  styles: `
    .visibility-demo {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .target-box {
      height: 80px;
      background: #161618;
      border: 1px dashed #3f3f46;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
    }

    .target-box.visible {
      border-color: #22c55e;
      background: rgba(34, 197, 94, 0.1);
    }

    .target-text {
      font-size: 0.875rem;
      font-weight: 500;
      color: #71717a;
    }

    .target-box.visible .target-text {
      color: #22c55e;
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

    .status-value {
      font-size: 0.875rem;
      font-weight: 500;
      color: #71717a;
    }

    .status-value.visible {
      color: #22c55e;
    }
  `,
})
export class ElementVisibilityDemo {
  readonly target = viewChild<HTMLElement>('target');
  readonly visibility = elementVisibility(this.target);

  readonly importCode = `import { elementVisibility } from '@signality/core'`;
}

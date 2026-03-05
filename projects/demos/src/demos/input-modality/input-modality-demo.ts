import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { inputModality } from '@signality/core/browser/input-modality';
import { DemoBadge, DemoCard, DemoInput, Wrapper } from '../../common';

@Component({
  selector: 'demo-input-modality',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard, DemoBadge, DemoInput],
  template: `
    <ng-demo-wrapper [code]="importCode">
      <div class="modality-demo">
        <div class="actions-area">
          <demo-input placeholder="Type something..." />
          <button class="click-btn" (click)="onClick()">Click me</button>
          <button class="touch-btn" (click)="onTouch()">Touch me</button>
        </div>

        <demo-card>
          <div class="status-row">
            <span class="status-label">Current Input</span>
            <demo-badge [type]="getModalityType()">
              {{ modality() ?? 'none' }}
            </demo-badge>
          </div>
        </demo-card>
      </div>
    </ng-demo-wrapper>
  `,
  styles: `
    .modality-demo {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .actions-area {
      display: flex;
      gap: 0.5rem;
    }

    .actions-area demo-input {
      flex: 1;
    }

    .click-btn, .touch-btn {
      padding: 0.5rem 0.75rem;
      font-size: 0.8125rem;
      font-weight: 500;
      color: #e4e4e7;
      background: #27272a;
      border: 1px solid #3f3f46;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .click-btn:hover, .touch-btn:hover {
      background: #3f3f46;
      border-color: #52525b;
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
export class InputModalityDemo {
  readonly modality = inputModality();

  readonly importCode = `import { inputModality } from '@signality/core'`;

  getModalityType(): 'success' | 'info' | 'warning' | 'neutral' {
    const mod = this.modality();
    if (mod === 'keyboard') return 'info';
    if (mod === 'mouse') return 'success';
    if (mod === 'touch') return 'warning';
    return 'neutral';
  }

  onClick(): void {}

  onTouch(): void {}
}

import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { onLongPress } from '@signality/core/elements/on-long-press';
import { DemoBadge, DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-on-long-press',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard, DemoBadge],
  template: `
    <ng-demo-wrapper [code]="importCode">
      <div class="long-press-demo">
        <div
          #target
          class="press-box"
          [class.pressed]="isPressed()"
          [class.triggered]="triggered()"
        >
          <span class="press-text">{{
            triggered() ? 'Long press detected!' : 'Press and hold'
          }}</span>
        </div>

        <demo-card>
          <div class="status-row">
            <span class="status-label">Status</span>
            <demo-badge [type]="triggered() ? 'success' : 'neutral'">
              {{ triggered() ? 'Triggered!' : 'Waiting' }}
            </demo-badge>
          </div>
        </demo-card>
      </div>
    </ng-demo-wrapper>
  `,
  styles: `
    .long-press-demo {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .press-box {
      height: 80px;
      background: #161618;
      border: 1px dashed #3f3f46;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      user-select: none;
    }

    .press-box.pressed {
      border-color: #f59e0b;
      background: rgba(245, 158, 11, 0.1);
    }

    .press-box.triggered {
      border-color: #22c55e;
      background: rgba(34, 197, 94, 0.1);
    }

    .press-text {
      font-size: 0.875rem;
      color: #71717a;
    }

    .press-box.pressed .press-text {
      color: #f59e0b;
    }

    .press-box.triggered .press-text {
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
  `,
})
export class LongPressDemo {
  readonly target = viewChild<HTMLElement>('target');
  readonly isPressed = signal(false);
  readonly triggered = signal(false);

  readonly importCode = `import { onLongPress } from '@signality/core'`;

  constructor() {
    onLongPress(
      this.target,
      () => {
        this.triggered.set(true);
        setTimeout(() => this.triggered.set(false), 2000);
      },
      { delay: 500 }
    );
  }
}

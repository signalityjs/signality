import { ChangeDetectionStrategy, Component } from '@angular/core';
import { interval } from '@signality/core/scheduling/interval';
import { DemoButton, DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-interval',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard, DemoButton],
  template: `
    <ng-demo-wrapper [code]="importCode">
      <div class="interval-card">
        <demo-card>
          <div class="counter-display">
            <span class="counter-value">{{ timer.counter() }}</span>
            <span class="counter-label">ticks</span>
          </div>
        </demo-card>

        <demo-card>
          <div class="status-row">
            <span class="status-label">Status</span>
            <span class="status-value" [class.running]="timer.isActive()">
              {{ timer.isActive() ? 'Running' : 'Stopped' }}
            </span>
          </div>
        </demo-card>

        <div class="controls">
          @if (timer.isActive()) {
          <demo-button variant="secondary" (click)="timer.pause()">Pause</demo-button>
          } @else {
          <demo-button variant="primary" (click)="timer.resume()">Resume</demo-button>
          }
          <demo-button variant="ghost" (click)="timer.reset()">Reset</demo-button>
        </div>
      </div>
    </ng-demo-wrapper>
  `,
  styles: `
    .interval-card {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .counter-display {
      display: flex;
      align-items: baseline;
      justify-content: center;
      gap: 0.5rem;
    }

    .counter-value {
      font-size: 2.5rem;
      font-weight: 700;
      color: #e4e4e7;
      line-height: 1;
    }

    .counter-label {
      font-size: 1rem;
      color: #a1a1aa;
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

    .status-value.running {
      color: #22c55e;
    }

    .controls {
      display: flex;
      gap: 0.5rem;
      justify-content: center;
    }
  `,
})
export class IntervalDemo {
  readonly timer = interval(
    () => {
      /* empty */
    },
    1000,
    { immediate: true }
  );

  readonly importCode = `import { interval } from '@signality/core'`;
}

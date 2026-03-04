import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { fps } from '@signality/core/browser/fps';
import { DemoButton, DemoCard, DemoProgress, Wrapper } from '../../common';

@Component({
  selector: 'demo-fps',
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard, DemoButton, DemoProgress],
  template: `
    <ng-demo-wrapper [code]="importCode">
      <div class="fps-card">
        <demo-card>
          <div class="fps-display">
            <span class="fps-value">{{ fpsMonitor.fps() }}</span>
            <span class="fps-label">FPS</span>
          </div>
          <demo-progress
            [value]="fpsMonitor.fps()"
            [max]="60"
            [color]="getFpsColor()"
            [showValue]="false"
          />
        </demo-card>

        <demo-card>
          <div class="status-row">
            <span class="status-label">Status</span>
            <span class="status-value" [class.running]="fpsMonitor.isRunning()">
              {{ fpsMonitor.isRunning() ? 'Running' : 'Stopped' }}
            </span>
          </div>
        </demo-card>

        <div class="controls">
          @if (fpsMonitor.isRunning()) {
          <demo-button variant="secondary" (click)="fpsMonitor.stop()">Stop</demo-button>
          } @else {
          <demo-button variant="primary" (click)="fpsMonitor.start()">Start</demo-button>
          }
        </div>
      </div>
    </ng-demo-wrapper>
  `,
  styles: `
    .fps-card {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .fps-display {
      display: flex;
      align-items: baseline;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
    }

    .fps-value {
      font-size: 2.5rem;
      font-weight: 700;
      color: #e4e4e7;
      line-height: 1;
    }

    .fps-label {
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
      justify-content: center;
    }
  `,
})
export class FpsDemo {
  readonly fpsMonitor = fps();

  readonly importCode = `import { fps } from '@signality/core'`;

  getFpsColor(): string {
    const fpsValue = this.fpsMonitor.fps();
    if (fpsValue >= 50) return '#22c55e';
    if (fpsValue >= 30) return '#f59e0b';
    return '#ef4444';
  }
}

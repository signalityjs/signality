import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { fps } from '@signality/core/browser/fps';
import { DemoCard, DemoProgress, Wrapper } from '../../common';

@Component({
  selector: 'demo-fps',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard, DemoProgress],
  template: `
    <ng-demo-wrapper [demoPath]="'fps/fps-demo'" [code]="importCode">
      <demo-card>
        <!-- FPS display -->
        <div class="fps-display">
          <span class="fps-value">{{ fpsMonitor.fps() }}</span>
          <span class="fps-unit">FPS</span>
        </div>

        <!-- Progress bar -->
        <demo-progress
          [value]="fpsMonitor.fps()"
          [max]="60"
          [color]="fpsColor()"
          [showValue]="false"
        />

        <!-- Divider + footer -->
        <div class="fps-divider"></div>
        <div class="fps-footer">
          <span class="fps-status" [class.fps-status--running]="fpsMonitor.isRunning()">
            <span class="fps-dot" [class.fps-dot--running]="fpsMonitor.isRunning()"></span>
            {{ fpsMonitor.isRunning() ? 'Running' : 'Stopped' }}
          </span>
          <button class="fps-btn" (click)="toggle()">
            {{ fpsMonitor.isRunning() ? 'Stop' : 'Start' }}
          </button>
        </div>
      </demo-card>
    </ng-demo-wrapper>
  `,
  styles: `
    /* ── FPS display ── */
    .fps-display {
      display: flex;
      align-items: baseline;
      gap: 0.375rem;
      margin-bottom: 0.75rem;
    }

    .fps-value {
      font-size: 2.5rem;
      font-weight: 700;
      letter-spacing: -0.03em;
      color: #e4e4e7;
      line-height: 1;
      font-variant-numeric: tabular-nums;
    }

    .fps-unit {
      font-size: 1rem;
      font-weight: 500;
      color: #52525b;
    }

    /* ── Divider ── */
    .fps-divider {
      height: 1px;
      background: #1f1f22;
      margin: 0.875rem 0 0;
    }

    /* ── Footer ── */
    .fps-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 0.75rem;
    }

    .fps-status {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8125rem;
      color: #52525b;
      transition: color 0.3s ease;
    }

    .fps-status--running {
      color: #71717a;
    }

    .fps-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #3f3f46;
      transition: background 0.3s ease;
      flex-shrink: 0;
    }

    .fps-dot--running {
      background: #22c55e;
      box-shadow: 0 0 6px rgba(34, 197, 94, 0.5);
    }

    .fps-btn {
      font-size: 0.8125rem;
      font-family: inherit;
      color: #52525b;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
      transition: color 0.15s ease;
    }

    .fps-btn:hover {
      color: #a1a1aa;
    }
  `,
})
export class FpsDemo {
  readonly fpsMonitor = fps();

  readonly importCode = `import { fps } from '@signality/core'`;

  readonly fpsColor = computed(() => {
    const v = this.fpsMonitor.fps();
    if (v >= 50) return '#22c55e';
    if (v >= 30) return '#f59e0b';
    return '#ef4444';
  });

  toggle(): void {
    if (this.fpsMonitor.isRunning()) {
      this.fpsMonitor.stop();
    } else {
      this.fpsMonitor.start();
    }
  }
}

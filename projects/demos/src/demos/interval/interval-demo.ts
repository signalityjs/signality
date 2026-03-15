import { ChangeDetectionStrategy, Component } from '@angular/core';
import { interval } from '@signality/core/scheduling/interval';
import { DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-interval',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard],
  template: `
    <ng-demo-wrapper [demoPath]="'interval/interval-demo'" [code]="importCode">
      <demo-card>
        <!-- Counter -->
        <div class="iv-counter">
          <span class="iv-value">{{ timer.counter() }}</span>
          <span class="iv-unit">ticks</span>
        </div>

        <!-- Divider -->
        <div class="iv-divider"></div>

        <!-- Footer -->
        <div class="iv-footer">
          <span class="iv-status" [class.iv-status--active]="timer.isActive()">
            <span class="iv-dot" [class.iv-dot--active]="timer.isActive()"></span>
            {{ timer.isActive() ? 'Running' : 'Stopped' }}
          </span>
          <div class="iv-actions">
            <button class="iv-btn iv-btn--muted" (click)="timer.reset()">Reset</button>
            @if (timer.isActive()) {
            <button class="iv-btn iv-btn--secondary" (click)="timer.pause()">Pause</button>
            } @else {
            <button class="iv-btn iv-btn--accent" (click)="timer.resume()">Resume</button>
            }
          </div>
        </div>
      </demo-card>
    </ng-demo-wrapper>
  `,
  styles: `
    /* ── Counter ── */
    .iv-counter {
      display: flex;
      align-items: baseline;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.5rem 0 0.75rem;
    }

    .iv-value {
      font-size: 2.5rem;
      font-weight: 700;
      color: #e4e4e7;
      line-height: 1;
      font-variant-numeric: tabular-nums;
      letter-spacing: -0.02em;
      min-width: 3ch;
      text-align: right;
    }

    .iv-unit {
      font-size: 0.9375rem;
      color: #52525b;
      font-weight: 400;
    }

    /* ── Divider ── */
    .iv-divider {
      height: 1px;
      background: #1f1f22;
    }

    /* ── Footer ── */
    .iv-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 0.75rem;
    }

    .iv-status {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8125rem;
      color: #52525b;
      transition: color 0.3s ease;
    }

    .iv-status--active {
      color: #a1a1aa;
    }

    /* ── Status dot ── */
    .iv-dot {
      position: relative;
      width: 6px;
      height: 6px;
      flex-shrink: 0;
    }

    .iv-dot::before,
    .iv-dot::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: #3f3f46;
      transition: background 0.3s ease;
    }

    .iv-dot--active::before,
    .iv-dot--active::after {
      background: #22c55e;
    }

    .iv-dot--active::after {
      animation: ivPulse 2s ease-out infinite;
    }

    @keyframes ivPulse {
      0%   { transform: scale(1); opacity: 0.6; }
      100% { transform: scale(3); opacity: 0; }
    }

    /* ── Actions ── */
    .iv-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .iv-btn {
      font-size: 0.8125rem;
      font-family: inherit;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
      transition: color 0.15s ease;
    }

    .iv-btn--muted {
      color: #52525b;
    }

    .iv-btn--muted:hover {
      color: #a1a1aa;
    }

    .iv-btn--secondary {
      color: #71717a;
    }

    .iv-btn--secondary:hover {
      color: #a1a1aa;
    }

    .iv-btn--accent {
      color: #DEB3EB;
    }

    .iv-btn--accent:hover {
      color: #e8c8f5;
    }
  `,
})
export class IntervalDemo {
  readonly timer = interval(
    () => {
      /* tick */
    },
    1000,
    { immediate: true }
  );

  readonly importCode = `import { interval } from '@signality/core'`;
}

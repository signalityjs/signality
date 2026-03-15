import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { onLongPress } from '@signality/core/elements/on-long-press';
import { DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-on-long-press',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard],
  template: `
    <ng-demo-wrapper [demoPath]="'long-press/long-press-demo'" [code]="importCode">
      <demo-card>
        <!-- Press zone -->
        <div
          #target
          class="lp-zone"
          [class.lp-zone--pressing]="isPressed() && !triggered()"
          [class.lp-zone--triggered]="triggered()"
          (pointerdown)="isPressed.set(true)"
          (pointerup)="isPressed.set(false)"
          (pointerleave)="isPressed.set(false)"
        >
          @if (triggered()) {
          <span class="lp-dot lp-dot--success"></span>
          } @else if (isPressed()) {
          <span class="lp-dot lp-dot--amber"></span>
          }
          {{ triggered() ? 'Long press!' : isPressed() ? 'Holding…' : 'Press and hold' }}
        </div>

        <!-- Divider -->
        <div class="lp-divider"></div>

        <!-- Footer -->
        <div class="lp-footer">
          <span
            class="lp-status"
            [class.lp-status--pressing]="isPressed() && !triggered()"
            [class.lp-status--triggered]="triggered()"
          >
            <span
              class="lp-status-dot"
              [class.lp-status-dot--amber]="isPressed() && !triggered()"
              [class.lp-status-dot--success]="triggered()"
            ></span>
            {{ triggered() ? 'Triggered' : isPressed() ? 'Holding…' : 'Waiting' }}
          </span>
          <span class="lp-count">{{ count() }} {{ count() === 1 ? 'trigger' : 'triggers' }}</span>
        </div>
      </demo-card>
    </ng-demo-wrapper>
  `,
  styles: `
    /* ── Press zone ── */
    .lp-zone {
      height: 96px;
      border: 1px dashed #27272a;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      font-size: 0.8125rem;
      color: #71717a;
      cursor: pointer;
      user-select: none;
      touch-action: none;
      transition: border-color 0.2s ease, background 0.2s ease, color 0.2s ease;
    }

    .lp-zone--pressing {
      border-color: rgba(245, 158, 11, 0.4);
      background: rgba(245, 158, 11, 0.04);
      color: #f59e0b;
    }

    .lp-zone--triggered {
      border-color: rgba(34, 197, 94, 0.35);
      background: rgba(34, 197, 94, 0.04);
      color: #22c55e;
    }

    /* ── Inline dot ── */
    .lp-dot {
      position: relative;
      display: inline-flex;
      width: 6px;
      height: 6px;
      flex-shrink: 0;
    }

    .lp-dot::before,
    .lp-dot::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 50%;
    }

    .lp-dot--amber::before,
    .lp-dot--amber::after {
      background: #f59e0b;
    }

    .lp-dot--amber::after {
      animation: lpPulse 1.2s ease-out infinite;
    }

    .lp-dot--success::before,
    .lp-dot--success::after {
      background: #22c55e;
    }

    .lp-dot--success::after {
      animation: lpPulse 2s ease-out infinite;
    }

    @keyframes lpPulse {
      0%   { transform: scale(1); opacity: 0.6; }
      100% { transform: scale(3); opacity: 0; }
    }

    /* ── Divider ── */
    .lp-divider {
      height: 1px;
      background: #1f1f22;
      margin: 0.875rem 0 0;
    }

    /* ── Footer ── */
    .lp-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 0.75rem;
    }

    .lp-status {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8125rem;
      color: #71717a;
      transition: color 0.2s ease;
    }

    .lp-status--pressing { color: #a1a1aa; }
    .lp-status--triggered { color: #a1a1aa; }

    /* ── Status dot ── */
    .lp-status-dot {
      position: relative;
      width: 6px;
      height: 6px;
      flex-shrink: 0;
    }

    .lp-status-dot::before,
    .lp-status-dot::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: #3f3f46;
      transition: background 0.2s ease;
    }

    .lp-status-dot--amber::before,
    .lp-status-dot--amber::after {
      background: #f59e0b;
    }

    .lp-status-dot--amber::after {
      animation: lpPulse 1.2s ease-out infinite;
    }

    .lp-status-dot--success::before,
    .lp-status-dot--success::after {
      background: #22c55e;
    }

    .lp-status-dot--success::after {
      animation: lpPulse 2s ease-out infinite;
    }

    /* ── Count ── */
    .lp-count {
      font-size: 0.8125rem;
      color: #52525b;
    }
  `,
})
export class LongPressDemo {
  readonly target = viewChild<HTMLElement>('target');
  readonly isPressed = signal(false);
  readonly triggered = signal(false);
  readonly count = signal(0);

  readonly importCode = `import { onLongPress } from '@signality/core'`;

  constructor() {
    onLongPress(
      this.target,
      () => {
        this.count.update(n => n + 1);
        this.triggered.set(true);
        setTimeout(() => this.triggered.set(false), 1500);
      },
      { delay: 500 }
    );
  }
}

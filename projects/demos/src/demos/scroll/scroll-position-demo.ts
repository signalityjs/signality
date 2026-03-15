import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { scrollPosition } from '@signality/core';
import { DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-scroll-position',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard],
  template: `
    <ng-demo-wrapper [code]="importCode">
      <demo-card>
        <!-- Info rows -->
        <div class="sp-rows">
          <div class="sp-row">
            <span class="sp-label">Scroll X</span>
            <span class="sp-value">{{ scrollPos.x() }}px</span>
          </div>
          <div class="sp-row">
            <span class="sp-label">Scroll Y</span>
            <span class="sp-value">{{ scrollPos.y() }}px</span>
          </div>
        </div>

        <!-- Divider -->
        <div class="sp-divider"></div>

        <!-- Footer -->
        <div class="sp-footer">
          <span class="sp-status" [class.sp-status--active]="hasScrolled()">
            <span class="sp-dot" [class.sp-dot--active]="hasScrolled()"></span>
            {{ hasScrolled() ? 'Scrolled' : 'At top' }}
          </span>
        </div>
      </demo-card>
    </ng-demo-wrapper>
  `,
  styles: `
    /* ── Info rows ── */
    .sp-rows {
      display: flex;
      flex-direction: column;
    }

    .sp-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.375rem 0;
    }

    .sp-row + .sp-row {
      border-top: 1px solid #1f1f22;
    }

    .sp-label {
      font-size: 0.8125rem;
      color: #71717a;
    }

    .sp-value {
      font-size: 0.8125rem;
      color: #a1a1aa;
      font-variant-numeric: tabular-nums;
    }

    /* ── Divider ── */
    .sp-divider {
      height: 1px;
      background: #1f1f22;
      margin: 0.875rem 0 0;
    }

    /* ── Footer ── */
    .sp-footer {
      display: flex;
      align-items: center;
      padding-top: 0.75rem;
    }

    .sp-status {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8125rem;
      color: #52525b;
      transition: color 0.25s ease;
    }

    .sp-status--active {
      color: #a1a1aa;
    }

    /* ── Status dot ── */
    .sp-dot {
      position: relative;
      width: 6px;
      height: 6px;
      flex-shrink: 0;
    }

    .sp-dot::before,
    .sp-dot::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: #3f3f46;
      transition: background 0.25s ease;
    }

    .sp-dot--active::before,
    .sp-dot--active::after {
      background: #22c55e;
    }

    .sp-dot--active::after {
      animation: spPulse 2s ease-out infinite;
    }

    @keyframes spPulse {
      0%   { transform: scale(1); opacity: 0.6; }
      100% { transform: scale(3); opacity: 0; }
    }
  `,
})
export class ScrollPositionDemo {
  readonly scrollPos = scrollPosition();

  readonly hasScrolled = computed(() => this.scrollPos.x() !== 0 || this.scrollPos.y() !== 0);

  readonly importCode = `import { scrollPosition } from '@signality/core'`;
}

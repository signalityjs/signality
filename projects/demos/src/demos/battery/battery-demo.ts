import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { battery } from '@signality/core/browser/battery';
import { DemoCard, DemoNotSupported, DemoProgress, Wrapper } from '../../common';

@Component({
  selector: 'demo-battery',
  imports: [Wrapper, DemoCard, DemoProgress, DemoNotSupported],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-demo-wrapper [demoPath]="'battery/battery-demo'" [code]="importCode">
      @if (!bt.isSupported()) {
      <demo-not-supported
        title="Battery API Not Available"
        description="Battery Status API is not supported in this browser."
        [hints]="['Chrome 38+', 'Edge 79+', 'Opera 25+']"
      >
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <rect x="2" y="7" width="16" height="10" rx="2" />
          <path d="M22 11v2" />
        </svg>
      </demo-not-supported>
      } @else {
      <demo-card>
        <!-- Level + progress -->
        <div class="bt-level">
          <span class="bt-pct">
            {{ pct()
            }}<span style="font-size: 1.375rem; margin-left: 0.125rem; opacity: 0.75">%</span>
          </span>
          <demo-progress [value]="pct()" [color]="levelColor()" [showValue]="false" />
        </div>

        <!-- Info rows -->
        <div class="bt-rows">
          <div class="bt-row">
            <span class="bt-label">Charging</span>
            <span class="bt-value">
              <span class="bt-dot" [style.--dot-color]="levelColor()"></span>
              {{ bt.charging() ? 'Yes' : 'No' }}
            </span>
          </div>
          <div class="bt-row">
            <span class="bt-label">Charging time</span>
            <span class="bt-value">{{ formatTime(bt.chargingTime()) }}</span>
          </div>
          <div class="bt-row">
            <span class="bt-label">Remaining</span>
            <span class="bt-value">{{ formatTime(bt.dischargingTime()) }}</span>
          </div>
        </div>
      </demo-card>
      }
    </ng-demo-wrapper>
  `,
  styles: `
    /* ── Level ── */
    .bt-level {
      display: flex;
      flex-direction: column;
      gap: 0.625rem;
      padding-bottom: 0.75rem;
    }

    .bt-pct {
      font-size: 1.625rem;
      font-weight: 600;
      color: #EEEEEE;
      line-height: 2.5rem;
      transition: color 0.4s ease;
    }

    /* ── Rows ── */
    .bt-rows {
      display: flex;
      flex-direction: column;
    }

    .bt-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.375rem 0;

      &:last-of-type {
        padding-bottom: 0;
      }
    }

    .bt-row + .bt-row {
      border-top: 1px solid #1f1f22;
    }

    .bt-label {
      font-size: 0.8125rem;
      color: #71717a;
    }

    .bt-value {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8125rem;
      color: #a1a1aa;
      font-variant-numeric: tabular-nums;
    }

    .bt-dot {
      position: relative;
      display: inline-block;
      width: 6px;
      height: 6px;
      flex-shrink: 0;
    }

    .bt-dot::before,
    .bt-dot::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: var(--dot-color, #3f3f46);
      transition: background 0.4s ease;
    }

    .bt-dot::after {
      animation: btPulse 2s ease-out infinite;
    }

    @keyframes btPulse {
      0%   { transform: scale(1); opacity: 0.6; }
      100% { transform: scale(3); opacity: 0; }
    }
  `,
})
export class BatteryDemo {
  readonly bt = battery();

  readonly importCode = `import { battery } from '@signality/core'`;

  readonly pct = computed(() => Math.round(this.bt.level() * 100));

  readonly levelColor = computed(() => {
    if (!this.bt.charging()) return '#3f3f46';
    const p = this.pct();
    if (p <= 20) return '#ef4444';
    if (p <= 50) return '#f59e0b';
    return '#22c55e';
  });

  readonly statusLabel = computed(() => {
    if (this.bt.charging()) return `Charging — ${this.pct()}%`;
    const p = this.pct();
    if (p <= 20) return `Low battery — ${p}%`;
    return `Discharging — ${p}%`;
  });

  formatTime(seconds: number): string {
    if (!isFinite(seconds) || seconds <= 0) return '—';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }
}

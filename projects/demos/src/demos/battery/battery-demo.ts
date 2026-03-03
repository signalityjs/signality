import { ChangeDetectionStrategy, Component } from '@angular/core';
import { battery } from '@signality/core/browser/battery';
import { DemoBadge, DemoCard, DemoProgress, Wrapper } from '../../common';

@Component({
  selector: 'demo-battery',
  imports: [Wrapper, DemoProgress, DemoBadge, DemoCard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-demo-wrapper [code]="importCode">
      @if (!batteryStatus.isSupported()) {
      <div class="not-supported">
        <demo-badge type="error">Battery API not supported</demo-badge>
        <p class="not-supported-text">The Battery Status API is not supported in this browser.</p>
      </div>
      } @if (batteryStatus.isSupported()) {
      <div class="battery-card">
        <div class="battery-main">
          <div class="battery-info">
            <span class="battery-percentage">{{ (batteryStatus.level() * 100).toFixed(0) }}%</span>
            <demo-progress
              [value]="batteryStatus.level() * 100"
              [color]="getLevelColor(batteryStatus.level())"
              [showValue]="false"
            />
          </div>
        </div>

        <demo-card>
          <div class="details-grid">
            <div class="detail-item">
              <span class="detail-label">Charging Time</span>
              <span class="detail-value">
                @if (isInfinity(batteryStatus.chargingTime())) {
                <span class="detail-muted">.inf</span>
                } @else {
                {{ formatTime(batteryStatus.chargingTime()) }}
                }
              </span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Discharging Time</span>
              <span class="detail-value">
                @if (isInfinity(batteryStatus.dischargingTime())) {
                <span class="detail-muted">.inf</span>
                } @else {
                {{ formatTime(batteryStatus.dischargingTime()) }}
                }
              </span>
            </div>
          </div>
        </demo-card>
      </div>
      }
    </ng-demo-wrapper>
  `,
  styles: `
    .not-supported {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      padding: 2rem;
      text-align: center;
    }

    .not-supported-text {
      color: #a1a1aa;
      font-size: 0.875rem;
      margin: 0;
    }

    .battery-card {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .battery-main {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .battery-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      min-width: 0;
    }

    .battery-percentage {
      font-size: 1.5rem;
      font-weight: 600;
      color: #e4e4e7;
      line-height: 1.5;
    }

    .details-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .detail-label {
      font-size: 0.75rem;
      font-weight: 500;
      color: #a1a1aa;
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }

    .detail-value {
      font-size: 0.9375rem;
      font-weight: 500;
      color: #e4e4e7;
    }

    .detail-muted {
      color: #71717a;
      font-style: italic;
    }
  `,
})
export class BatteryDemo {
  readonly batteryStatus = battery();

  readonly importCode = `import { battery } from '@signality/core'`;

  getLevelColor(level: number): string {
    if (level <= 0.2) return '#ef4444';
    if (level <= 0.5) return '#f59e0b';
    return '#22c55e';
  }

  formatTime(seconds: number): string {
    if (!isFinite(seconds) || seconds === 0) return '0';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  isInfinity(value: number): boolean {
    return !isFinite(value);
  }
}

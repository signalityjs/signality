import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { battery } from '@signality/core';
import { DemoCard, DemoNotSupported, DemoProgress, Wrapper } from '../../common';

@Component({
  selector: 'demo-battery',
  imports: [Wrapper, DemoCard, DemoProgress, DemoNotSupported],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './battery-demo.html',
  styleUrl: './battery-demo.scss',
})
export class BatteryDemo {
  readonly importCode = `import { battery } from '@signality/core'`;

  readonly bt = battery();

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

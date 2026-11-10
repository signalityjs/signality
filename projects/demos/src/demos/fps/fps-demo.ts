import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { fpsMonitor } from '@signality/core';
import { DemoCard, DemoProgress, Wrapper } from '../../common';

@Component({
  selector: 'demo-fps',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard, DemoProgress],
  templateUrl: './fps-demo.html',
  styleUrl: './fps-demo.scss',
})
export class FpsDemo {
  readonly importCode = `import { fpsMonitor } from '@signality/core'`;

  readonly monitor = fpsMonitor();

  readonly fpsColor = computed(() => {
    const v = this.monitor.value();
    if (v >= 50) return '#22c55e';
    if (v >= 30) return '#f59e0b';
    return '#ef4444';
  });

  toggle(): void {
    if (this.monitor.isRunning()) {
      this.monitor.stop();
    } else {
      this.monitor.start();
    }
  }
}

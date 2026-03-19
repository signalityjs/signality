import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { fps } from '@signality/core';
import { DemoCard, DemoProgress, Wrapper } from '../../common';

@Component({
  selector: 'demo-fps',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard, DemoProgress],
  templateUrl: './fps-demo.html',
  styleUrl: './fps-demo.scss',
})
export class FpsDemo {
  readonly importCode = `import { fps } from '@signality/core'`;

  readonly fpsMonitor = fps();

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

import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { devicePixelRatio } from '@signality/core';
import { DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-device-pixel-ratio',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard],
  templateUrl: './device-pixel-ratio-demo.html',
  styleUrl: './device-pixel-ratio-demo.scss',
})
export class DevicePixelRatioDemo {
  readonly importCode = `import { devicePixelRatio } from '@signality/core'`;

  readonly pixelRatio = devicePixelRatio();

  readonly gridSize = computed(() => Math.round(3 + this.pixelRatio() * 2));
  readonly gridCells = computed(() => {
    const size = this.gridSize();
    const cells: { row: number; col: number }[] = [];
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        cells.push({ row: r, col: c });
      }
    }
    return cells;
  });
}

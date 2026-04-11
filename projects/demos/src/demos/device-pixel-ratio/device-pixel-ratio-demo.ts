import { ChangeDetectionStrategy, Component } from '@angular/core';
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
}

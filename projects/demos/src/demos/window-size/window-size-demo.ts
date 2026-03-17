import { ChangeDetectionStrategy, Component } from '@angular/core';
import { windowSize } from '@signality/core';
import { DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-window-size',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard],
  templateUrl: './window-size-demo.html',
  styleUrl: './window-size-demo.scss',
})
export class WindowSizeDemo {
  readonly importCode = `import { windowSize } from '@signality/core'`;

  readonly size = windowSize();
}

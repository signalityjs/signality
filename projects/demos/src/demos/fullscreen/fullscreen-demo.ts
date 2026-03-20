import { ChangeDetectionStrategy, Component } from '@angular/core';
import { fullscreen } from '@signality/core';
import { DemoButton, DemoCard, DemoNotSupported, Wrapper } from '../../common';

@Component({
  selector: 'demo-fullscreen',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard, DemoButton, DemoNotSupported],
  templateUrl: './fullscreen-demo.html',
  styleUrl: './fullscreen-demo.scss',
})
export class FullscreenDemo {
  readonly importCode = `import { fullscreen } from '@signality/core'`;

  readonly fs = fullscreen();
  readonly isActive = this.fs.isActive;

  async handleToggle(): Promise<void> {
    await this.fs.toggle();
  }
}

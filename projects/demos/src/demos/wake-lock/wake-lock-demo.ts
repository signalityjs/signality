import { ChangeDetectionStrategy, Component } from '@angular/core';
import { wakeLock } from '@signality/core';
import { DemoCard, DemoNotSupported, Wrapper } from '../../common';

@Component({
  selector: 'demo-wake-lock',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard, DemoNotSupported],
  templateUrl: './wake-lock-demo.html',
  styleUrl: './wake-lock-demo.scss',
})
export class WakeLockDemo {
  readonly importCode = `import { wakeLock } from '@signality/core'`;

  readonly wl = wakeLock();

  toggle(): void {
    if (this.wl.isActive()) {
      this.wl.release();
    } else {
      this.wl.request();
    }
  }
}

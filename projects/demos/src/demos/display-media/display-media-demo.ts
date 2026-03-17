import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { displayMedia } from '@signality/core';
import { DemoCard, DemoNotSupported, Wrapper } from '../../common';

@Component({
  selector: 'demo-display-media',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard, DemoNotSupported],
  templateUrl: './display-media-demo.html',
  styleUrl: './display-media-demo.scss',
})
export class DisplayMediaDemo {
  readonly importCode = `import { displayMedia } from '@signality/core'`;

  readonly dm = displayMedia();

  readonly state = computed<'unsupported' | 'idle' | 'active' | 'error'>(() => {
    if (!this.dm.isSupported()) return 'unsupported';
    if (this.dm.error()) return 'error';
    if (this.dm.isActive()) return 'active';
    return 'idle';
  });

  readonly errorMessage = computed(() => {
    const err = this.dm.error();
    if (!err) return '';
    if (err.name === 'NotAllowedError') return 'Permission denied by user';
    if (err.name === 'NotFoundError') return 'No capture source found';
    return err.message;
  });

  readonly buttonLabel = computed(() => {
    if (this.state() === 'active') return 'Stop Capture';
    if (this.state() === 'error') return 'Try again';
    return 'Start Capture';
  });

  async toggle(): Promise<void> {
    if (this.dm.isActive()) {
      this.dm.stop();
    } else {
      await this.dm.start();
    }
  }
}

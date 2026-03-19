import { ChangeDetectionStrategy, Component } from '@angular/core';
import { webShare } from '@signality/core';
import { DemoCard, DemoNotSupported, Wrapper } from '../../common';

@Component({
  selector: 'demo-web-share',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard, DemoNotSupported],
  templateUrl: './web-share-demo.html',
  styleUrl: './web-share-demo.scss',
})
export class WebShareDemo {
  readonly importCode = `import { webShare } from '@signality/core'`;

  readonly webShare = webShare();

  async share(): Promise<void> {
    await this.webShare.share({
      title: 'Signality',
      text: 'Reactive utilities for Angular',
      url: 'https://signality.dev',
    });
  }
}

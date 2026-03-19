import { ChangeDetectionStrategy, Component } from '@angular/core';
import { network } from '@signality/core';
import { DemoCard, DemoNotSupported, Wrapper } from '../../common';

@Component({
  selector: 'demo-network',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard, DemoNotSupported],
  templateUrl: './network-demo.html',
  styleUrl: './network-demo.scss',
})
export class NetworkDemo {
  readonly importCode = `import { network } from '@signality/core'`;

  readonly net = network();
}

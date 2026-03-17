import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { interval } from '@signality/core';
import { DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-interval',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard],
  templateUrl: './interval-demo.html',
  styleUrl: './interval-demo.scss',
})
export class IntervalDemo {
  readonly importCode = `import { interval } from '@signality/core'`;

  readonly ticks = signal(0);

  readonly timer = interval(() => this.ticks.update(n => n + 1), 1000);
}

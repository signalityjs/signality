import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { online } from '@signality/core';
import { DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-online',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard],
  templateUrl: './online-demo.html',
  styleUrl: './online-demo.scss',
})
export class OnlineDemo {
  readonly importCode = `import { online } from '@signality/core'`;

  readonly isOnline = online();

  readonly onlineOpacity = computed(() => (this.isOnline() ? 1 : 0));
  readonly offlineOpacity = computed(() => (this.isOnline() ? 0 : 1));
}

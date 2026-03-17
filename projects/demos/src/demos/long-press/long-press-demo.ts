import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { onLongPress } from '@signality/core';
import { DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-on-long-press',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard],
  templateUrl: './long-press-demo.html',
  styleUrl: './long-press-demo.scss',
})
export class LongPressDemo {
  readonly importCode = `import { onLongPress } from '@signality/core'`;

  readonly target = viewChild<HTMLElement>('target');
  readonly isPressed = signal(false);
  readonly triggered = signal(false);
  readonly count = signal(0);

  constructor() {
    onLongPress(
      this.target,
      () => {
        this.count.update(n => n + 1);
        this.triggered.set(true);
        setTimeout(() => this.triggered.set(false), 1500);
      },
      { delay: 500 }
    );
  }
}

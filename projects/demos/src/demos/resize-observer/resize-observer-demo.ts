import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { resizeObserver } from '@signality/core';
import { DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-resize-observer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard],
  templateUrl: './resize-observer-demo.html',
  styleUrl: './resize-observer-demo.scss',
})
export class ResizeObserverDemo {
  readonly importCode = `import { resizeObserver } from '@signality/core'`;

  readonly resizable = viewChild<HTMLElement>('resizable');
  readonly size = signal({ width: 0, height: 0 });

  constructor() {
    resizeObserver(this.resizable, entries => {
      const { width, height } = entries[0].contentRect;
      this.size.set({ width, height });
    });
  }
}

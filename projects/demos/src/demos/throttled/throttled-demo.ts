import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { throttled } from '@signality/core';
import { DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-throttled',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard],
  templateUrl: './throttled-demo.html',
  styleUrl: './throttled-demo.scss',
})
export class ThrottledDemo {
  readonly importCode = `import { throttled } from '@signality/core'`;

  readonly immediateX = signal(0);
  readonly immediateY = signal(0);
  readonly throttledX = throttled(0, 100);
  readonly throttledY = throttled(0, 100);

  onMouseMove(event: MouseEvent): void {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const x = Math.round(event.clientX - rect.left);
    const y = Math.round(event.clientY - rect.top);

    this.immediateX.set(x);
    this.immediateY.set(y);
    this.throttledX.set(x);
    this.throttledY.set(y);
  }
}

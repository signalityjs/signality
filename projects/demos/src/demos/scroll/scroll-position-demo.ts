import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { scrollPosition } from '@signality/core';
import { DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-scroll-position',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard],
  templateUrl: './scroll-position-demo.html',
  styleUrl: './scroll-position-demo.scss',
})
export class ScrollPositionDemo {
  readonly importCode = `import { scrollPosition } from '@signality/core'`;

  readonly scrollPos = scrollPosition();

  readonly hasScrolled = computed(() => this.scrollPos.x() !== 0 || this.scrollPos.y() !== 0);
}

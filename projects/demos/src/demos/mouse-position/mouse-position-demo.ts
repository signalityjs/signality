import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { mousePosition } from '@signality/core';
import { DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-mouse-position',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard],
  templateUrl: './mouse-position-demo.html',
  styleUrl: './mouse-position-demo.scss',
})
export class MousePositionDemo {
  readonly importCode = `import { mousePosition } from '@signality/core'`;

  readonly position = mousePosition({ type: 'client' });

  readonly isVisible = computed(() => this.position().x !== 0 && this.position().y !== 0);
}

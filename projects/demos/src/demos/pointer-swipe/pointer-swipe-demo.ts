import { ChangeDetectionStrategy, Component, computed, viewChild } from '@angular/core';
import { pointerSwipe } from '@signality/core';
import { DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-pointer-swipe',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard],
  templateUrl: './pointer-swipe-demo.html',
  styleUrl: './pointer-swipe-demo.scss',
})
export class PointerSwipeDemo {
  readonly importCode = `import { pointerSwipe } from '@signality/core'`;

  readonly swipeArea = viewChild<HTMLElement>('swipeArea');
  readonly sw = pointerSwipe(this.swipeArea);

  readonly arrowRotation = computed(() => {
    switch (this.sw.direction()) {
      case 'up':
        return 0;
      case 'down':
        return 180;
      case 'left':
        return -90;
      case 'right':
        return 90;
      default:
        return 0;
    }
  });

  readonly directionLabel = computed(() => {
    switch (this.sw.direction()) {
      case 'up':
        return '↑ Up';
      case 'down':
        return '↓ Down';
      case 'left':
        return '← Left';
      case 'right':
        return '→ Right';
      default:
        return '—';
    }
  });
}

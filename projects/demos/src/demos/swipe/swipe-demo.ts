import { ChangeDetectionStrategy, Component, computed, viewChild } from '@angular/core';
import { swipe, type SwipeDirection } from '@signality/core';
import { DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-swipe',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard],
  templateUrl: './swipe-demo.html',
  styleUrl: './swipe-demo.scss',
})
export class SwipeDemo {
  readonly importCode = `import { swipe } from '@signality/core'`;

  readonly swipeArea = viewChild<HTMLElement>('swipeArea');
  readonly sw = swipe(this.swipeArea);

  readonly directionLabel = computed(() => {
    const map: Record<SwipeDirection, string> = {
      none: '—',
      left: '← Left',
      right: '→ Right',
      up: '↑ Up',
      down: '↓ Down',
    };
    return map[this.sw.direction()];
  });

  readonly arrowRotation = computed(() => {
    const map: Record<SwipeDirection, string> = {
      none: 'rotate(0deg)',
      up: 'rotate(0deg)',
      down: 'rotate(180deg)',
      left: 'rotate(-90deg)',
      right: 'rotate(90deg)',
    };
    return map[this.sw.direction()];
  });
}

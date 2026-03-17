import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { screenOrientation } from '@signality/core';
import { DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-screen-orientation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard],
  templateUrl: './screen-orientation-demo.html',
  styleUrl: './screen-orientation-demo.scss',
})
export class ScreenOrientationDemo {
  readonly importCode = `import { screenOrientation } from '@signality/core'`;

  readonly orientation = screenOrientation();

  readonly rotation = computed(() => {
    switch (this.orientation()) {
      case 'portrait-primary':
        return 0;
      case 'landscape-primary':
        return 90;
      case 'portrait-secondary':
        return 180;
      case 'landscape-secondary':
        return 270;
      default:
        return 0;
    }
  });

  readonly orientationType = computed(() =>
    this.orientation().startsWith('portrait') ? 'Portrait' : 'Landscape'
  );

  readonly orientationVariant = computed(() =>
    this.orientation().endsWith('primary') ? 'primary' : 'secondary'
  );
}

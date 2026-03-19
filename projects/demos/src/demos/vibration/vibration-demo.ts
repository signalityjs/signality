import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { vibration } from '@signality/core';
import { DemoCard, DemoNotSupported, Wrapper } from '../../common';

@Component({
  selector: 'demo-vibration',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard, DemoNotSupported],
  templateUrl: './vibration-demo.html',
  styleUrl: './vibration-demo.scss',
})
export class VibrationDemo {
  readonly importCode = `import { vibration } from '@signality/core'`;

  readonly vib = vibration();

  readonly idleOpacity = computed(() => (this.vib.isVibrating() ? 0 : 1));
  readonly activeOpacity = computed(() => (this.vib.isVibrating() ? 1 : 0));

  vibrate(): void {
    this.vib.vibrate(200);
  }

  vibratePattern(): void {
    this.vib.vibrate([100, 50, 100, 50, 200]);
  }
}

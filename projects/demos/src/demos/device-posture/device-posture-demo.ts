import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { devicePosture } from '@signality/core';
import { DemoCard, DemoNotSupported, Wrapper } from '../../common';

@Component({
  selector: 'demo-device-posture',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard, DemoNotSupported],
  templateUrl: './device-posture-demo.html',
  styleUrl: './device-posture-demo.scss',
})
export class DevicePostureDemo {
  readonly importCode = `import { devicePosture } from '@signality/core'`;

  readonly posture = devicePosture();

  readonly title = computed(() => (this.posture.type() === 'folded' ? 'Folded' : 'Continuous'));

  readonly subtitle = computed(() =>
    this.posture.type() === 'folded' ? 'Device screen is folded' : 'Device is in flat open position'
  );

  readonly continuousOpacity = computed(() => (this.posture.type() === 'continuous' ? 1 : 0));
  readonly foldedOpacity = computed(() => (this.posture.type() === 'folded' ? 1 : 0));
}

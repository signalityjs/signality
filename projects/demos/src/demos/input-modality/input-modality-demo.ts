import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { inputModality } from '@signality/core';
import { DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-input-modality',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard],
  templateUrl: './input-modality-demo.html',
  styleUrl: './input-modality-demo.scss',
})
export class InputModalityDemo {
  readonly importCode = `import { inputModality } from '@signality/core'`;

  readonly modality = inputModality();

  readonly keyboardOpacity = computed(() => (this.modality() === 'keyboard' ? 1 : 0));
  readonly mouseOpacity = computed(() => (this.modality() === 'mouse' ? 1 : 0));
  readonly touchOpacity = computed(() => (this.modality() === 'touch' ? 1 : 0));

  readonly isKeyboard = computed(() => this.modality() === 'keyboard');
  readonly isMouse = computed(() => this.modality() === 'mouse');
  readonly isTouch = computed(() => this.modality() === 'touch');
  readonly isIdle = computed(() => this.modality() === null);
}

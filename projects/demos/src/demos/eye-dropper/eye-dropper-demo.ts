import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { eyeDropper } from '@signality/core';
import { DemoCard, DemoNotSupported, Wrapper } from '../../common';

@Component({
  selector: 'demo-eye-dropper',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard, DemoNotSupported],
  templateUrl: './eye-dropper-demo.html',
  styleUrl: './eye-dropper-demo.scss',
})
export class EyeDropperDemo {
  readonly importCode = `import { eyeDropper } from '@signality/core'`;

  readonly ed = eyeDropper();
  readonly isOpen = signal(false);

  readonly hasColor = computed(() => !!this.ed.sRGBHex());

  readonly ringBorder = computed(() => {
    const hex = this.ed.sRGBHex();
    return hex ? hex + '55' : 'rgba(255, 255, 255, 0.08)';
  });

  readonly glowStyle = computed(() => {
    const hex = this.ed.sRGBHex();
    if (!hex) return null;
    return `0 0 18px ${hex}50, 0 0 6px ${hex}30`;
  });

  async pick(): Promise<void> {
    this.isOpen.set(true);
    await this.ed.open();
    this.isOpen.set(false);
  }
}

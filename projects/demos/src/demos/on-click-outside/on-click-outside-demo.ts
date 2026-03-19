import { ChangeDetectionStrategy, Component, ElementRef, signal, viewChild } from '@angular/core';
import { onClickOutside } from '@signality/core';
import { DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-on-click-outside',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard],
  templateUrl: './on-click-outside-demo.html',
  styleUrl: './on-click-outside-demo.scss',
})
export class OnClickOutsideDemo {
  readonly importCode = `import { onClickOutside } from '@signality/core'`;

  readonly dropdown = viewChild<ElementRef>('dropdown');
  readonly btn = viewChild('trigger', { read: ElementRef });
  readonly isOpen = signal(false);
  readonly clickedOutside = signal(false);

  constructor() {
    onClickOutside(
      this.dropdown,
      () => {
        if (this.isOpen()) {
          this.clickedOutside.set(true);
          this.isOpen.set(false);
          setTimeout(() => this.clickedOutside.set(false), 1500);
        }
      },
      { ignore: [this.btn] }
    );
  }

  toggle(): void {
    this.isOpen.update(v => !v);
  }
}

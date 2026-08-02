import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { onKey } from '@signality/core';
import { DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-on-key',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard],
  templateUrl: './on-key-demo.html',
  styleUrl: './on-key-demo.scss',
})
export class OnKeyDemo {
  readonly importCode = `import { onKey } from '@signality/core'`;

  readonly lastKey = signal('');
  readonly enterCount = signal(0);
  readonly dedupe = signal(false);
  readonly paletteVisible = signal(false);

  private paletteTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    onKey(event => this.lastKey.set(event.key));

    onKey(
      'Enter',
      () => {
        this.enterCount.update(count => count + 1);
      },
      { dedupe: this.dedupe }
    );

    onKey(['Mod', 'Enter'], (event: KeyboardEvent) => {
      event.preventDefault();
      this.paletteVisible.set(true);
      clearTimeout(this.paletteTimer);
      this.paletteTimer = setTimeout(() => this.paletteVisible.set(false), 1500);
    });
  }

  toggleDedupe(): void {
    this.dedupe.update(value => !value);
  }
}

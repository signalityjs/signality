import { ChangeDetectionStrategy, Component } from '@angular/core';
import { favicon } from '@signality/core';
import { DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-favicon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard],
  templateUrl: './favicon-demo.html',
  styleUrl: './favicon-demo.scss',
})
export class FaviconDemo {
  readonly faviconRef = favicon();
  readonly emojis = ['🔴', '🟢', '🔵', '⭐', '🔥', '💀'];

  readonly importCode = `import { favicon } from '@signality/core'`;

  setEmoji(emoji: string): void {
    this.faviconRef.setEmoji(emoji);
  }

  reset(): void {
    this.faviconRef.reset();
  }
}

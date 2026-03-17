import { ChangeDetectionStrategy, Component } from '@angular/core';
import { mediaQuery } from '@signality/core';
import { DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-media-query',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard],
  templateUrl: './media-query-demo.html',
  styleUrl: './media-query-demo.scss',
})
export class MediaQueryDemo {
  readonly importCode = `import { mediaQuery } from '@signality/core'`;

  readonly prefersDark = mediaQuery('(prefers-color-scheme: dark)');
  readonly prefersReducedMotion = mediaQuery('(prefers-reduced-motion: reduce)');
  readonly isPortrait = mediaQuery('(orientation: portrait)');
  readonly hasHover = mediaQuery('(hover: hover)');
  readonly isCoarsePointer = mediaQuery('(pointer: coarse)');
}

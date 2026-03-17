import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { elementHover } from '@signality/core';
import { DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-element-hover',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard],
  templateUrl: './element-hover-demo.html',
  styleUrl: './element-hover-demo.scss',
})
export class ElementHoverDemo {
  readonly importCode = `import { elementHover } from '@signality/core'`;

  readonly hoverEl = viewChild<HTMLElement>('hoverEl');
  readonly isHovered = elementHover(this.hoverEl);
}

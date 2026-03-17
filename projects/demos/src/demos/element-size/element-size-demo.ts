import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { elementSize } from '@signality/core';
import { DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-element-size',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard],
  templateUrl: './element-size-demo.html',
  styleUrl: './element-size-demo.scss',
})
export class ElementSizeDemo {
  readonly importCode = `import { elementSize } from '@signality/core'`;

  readonly resizable = viewChild<HTMLElement>('resizable');
  readonly size = elementSize(this.resizable);
}

import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { elementFocusWithin } from '@signality/core';
import { DemoCard, DemoInput, Wrapper } from '../../common';

@Component({
  selector: 'demo-element-focus-within',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard, DemoInput],
  templateUrl: './element-focus-within-demo.html',
  styleUrl: './element-focus-within-demo.scss',
})
export class ElementFocusWithinDemo {
  readonly importCode = `import { elementFocusWithin } from '@signality/core'`;

  readonly container = viewChild<HTMLElement>('container');
  readonly isFocusedWithin = elementFocusWithin(this.container);
}

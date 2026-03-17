import { ChangeDetectionStrategy, Component, ElementRef, viewChild } from '@angular/core';
import { elementFocus } from '@signality/core';
import { DemoCard, DemoInput, Wrapper } from '../../common';

@Component({
  selector: 'demo-element-focus',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard, DemoInput],
  templateUrl: './element-focus-demo.html',
  styleUrl: './element-focus-demo.scss',
})
export class ElementFocusDemo {
  readonly importCode = `import { elementFocus } from '@signality/core'`;

  readonly inputEl = viewChild('inputEl', { read: ElementRef });
  readonly isFocused = elementFocus(this.inputEl);
}

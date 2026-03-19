import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { activeElement } from '@signality/core';
import { DemoCard, DemoInput, Wrapper } from '../../common';

@Component({
  selector: 'demo-active-element',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard, DemoInput],
  templateUrl: './active-element-demo.html',
  styleUrl: './active-element-demo.scss',
})
export class ActiveElementDemo {
  readonly importCode = `import { activeElement } from '@signality/core'`;

  readonly activeEl = activeElement();

  readonly isFocused = computed(() => {
    const el = this.activeEl();
    return !!el && el.tagName !== 'BODY';
  });
}

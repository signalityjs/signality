import { ChangeDetectionStrategy, Component } from '@angular/core';
import { textDirection } from '@signality/core';
import { DemoCard, DemoToggle, Wrapper } from '../../common';

@Component({
  selector: 'demo-text-direction',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard, DemoToggle],
  templateUrl: './text-direction-demo.html',
  styleUrl: './text-direction-demo.scss',
})
export class TextDirectionDemo {
  readonly importCode = `import { textDirection } from '@signality/core'`;

  readonly direction = textDirection();

  readonly directionOptions = [
    { label: 'LTR', value: 'ltr' as const },
    { label: 'RTL', value: 'rtl' as const },
  ];
}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { eyeDropper } from '@signality/core/browser/eye-dropper';
import { DemoBadge, DemoButton, Wrapper } from '../../common';

@Component({
  selector: 'demo-eye-dropper',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoButton, DemoBadge],
  template: `
    <ng-demo-wrapper>

    </ng-demo-wrapper>
  `,
  styles: `

  `,
})
export class EyeDropperDemo {
  readonly eyeDropper = eyeDropper();
}

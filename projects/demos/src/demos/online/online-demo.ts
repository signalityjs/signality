import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { online } from '@signality/core';
import { Wrapper } from '../../common';

@Component({
  selector: 'demo-online',
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-demo-wrapper>
    </ng-demo-wrapper>
  `,
  imports: [Wrapper],
})
export class OnlineDemo {
  readonly isOnline = online();
}

import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { Wrapper } from '../../common';

@Component({
  selector: 'demo-mutation-observer',
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-demo-wrapper>
    </ng-demo-wrapper>
  `,
  imports: [Wrapper],
})
export class MutationObserverDemo {}


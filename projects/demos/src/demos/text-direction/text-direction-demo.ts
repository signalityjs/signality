import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { Wrapper } from '../../common';

@Component({
  selector: 'demo-text-direction',
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-demo-wrapper>
    </ng-demo-wrapper>
  `,
  imports: [Wrapper],
})
export class TextDirectionDemo {}

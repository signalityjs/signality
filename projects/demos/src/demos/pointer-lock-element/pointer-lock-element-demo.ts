import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Wrapper } from '../../common';

@Component({
  selector: 'demo-pointer-lock-element',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-demo-wrapper [demoPath]="'pointer-lock-element/pointer-lock-element-demo'">
    </ng-demo-wrapper>
  `,
  imports: [Wrapper],
})
export class PointerLockElementDemo {}

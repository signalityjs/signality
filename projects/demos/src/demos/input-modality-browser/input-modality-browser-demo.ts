import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Wrapper } from '../../common';

@Component({
  selector: 'demo-input-modality-browser',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ` <ng-demo-wrapper> </ng-demo-wrapper> `,
  imports: [Wrapper],
})
export class InputModalityBrowserDemo {}

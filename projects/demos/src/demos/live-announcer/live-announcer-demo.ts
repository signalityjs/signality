import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Wrapper } from '../../common';

@Component({
  selector: 'demo-live-announcer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ` <ng-demo-wrapper> </ng-demo-wrapper> `,
  imports: [Wrapper],
})
export class LiveAnnouncerDemo {}

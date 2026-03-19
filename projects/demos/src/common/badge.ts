import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type DemoBadgeType = 'success' | 'warning' | 'error' | 'info' | 'neutral';

@Component({
  selector: 'demo-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './badge.html',
  styleUrl: './badge.scss',
})
export class DemoBadge {
  readonly type = input<DemoBadgeType>('neutral');
}

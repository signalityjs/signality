import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'demo-progress',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './progress-bar.html',
  styleUrl: './progress-bar.scss',
})
export class DemoProgress {
  readonly value = input(0);
  readonly max = input(100);
  readonly color = input('#DEB3EB');
  readonly showValue = input(true);
}

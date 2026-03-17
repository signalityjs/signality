import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'demo-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './card.html',
  styleUrl: './card.scss',
})
export class DemoCard {
  readonly bordered = input(false);
}

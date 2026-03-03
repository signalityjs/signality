import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'demo-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card" [class.card--bordered]="bordered()">
      <ng-content />
    </div>
  `,
  styles: `
    .card {
      padding: 1rem;
      background: #0f0f11;
      border-radius: 8px;
      border: 1px solid #1a1a1d;
    }

    .card--bordered {
      border-color: #27272a;
    }
  `,
})
export class DemoCard {
  readonly bordered = input(false);
}

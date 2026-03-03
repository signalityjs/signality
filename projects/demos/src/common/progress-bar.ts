import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'demo-progress',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="progress-wrapper">
      <div class="progress-track">
        <div class="progress-fill" [style.width.%]="value()" [style.background]="color()"></div>
      </div>
      @if (showValue()) {
      <span class="progress-value">{{ value().toFixed(0) }}%</span>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .progress-wrapper {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .progress-track {
      flex: 1;
      height: 8px;
      background: #27272a;
      border-radius: 4px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.3s ease, background 0.3s ease;
    }

    .progress-value {
      font-size: 0.875rem;
      font-weight: 500;
      color: #e4e4e7;
      min-width: 3rem;
      text-align: right;
    }
  `,
})
export class DemoProgress {
  readonly value = input(0);
  readonly color = input('#DEB3EB');
  readonly showValue = input(true);
}

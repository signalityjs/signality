import { ChangeDetectionStrategy, Component } from '@angular/core';
import { textDirection } from '@signality/core/browser/text-direction';
import { DemoCard, DemoToggle, Wrapper } from '../../common';

@Component({
  selector: 'demo-text-direction',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard, DemoToggle],
  template: `
    <ng-demo-wrapper [code]="importCode">
      <div class="direction-card">
        <demo-card>
          <div class="direction-row">
            <span class="direction-label">Current Direction</span>
            <demo-toggle [options]="directionOptions" [value]="direction" />
          </div>
        </demo-card>

        <div class="preview" [attr.dir]="direction()">
          <p class="preview-text">Hello, World!</p>
          <p class="preview-text">مرحبا بالعالم!</p>
          <p class="preview-text">שלום עולם!</p>
        </div>
      </div>
    </ng-demo-wrapper>
  `,
  styles: `
    .direction-card {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .direction-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }

    .direction-label {
      font-size: 0.875rem;
      font-weight: 500;
      color: #a1a1aa;
    }

    .preview {
      padding: 1rem;
      background: #0f0f11;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .preview-text {
      margin: 0;
      font-size: 1rem;
      color: #e4e4e7;
    }
  `,
})
export class TextDirectionDemo {
  readonly direction = textDirection();

  readonly directionOptions = [
    { label: 'LTR', value: 'ltr' as const },
    { label: 'RTL', value: 'rtl' as const },
  ];

  readonly importCode = `import { textDirection } from '@signality/core'`;
}

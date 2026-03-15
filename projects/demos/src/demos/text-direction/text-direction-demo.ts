import { ChangeDetectionStrategy, Component } from '@angular/core';
import { textDirection } from '@signality/core/browser/text-direction';
import { DemoCard, DemoToggle, Wrapper } from '../../common';

@Component({
  selector: 'demo-text-direction',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard, DemoToggle],
  template: `
    <ng-demo-wrapper [demoPath]="'text-direction/text-direction-demo'" [code]="importCode">
      <demo-card>
        <!-- Toggle row -->
        <div class="td-row">
          <span class="td-label">Direction</span>
          <demo-toggle [options]="directionOptions" [value]="direction" />
        </div>

        <!-- Divider -->
        <div class="td-divider"></div>

        <!-- Preview -->
        <div class="td-preview" [attr.dir]="direction()">
          <p class="td-text">Hello, World!</p>
          <p class="td-text">مرحبا بالعالم!</p>
          <p class="td-text">שלום עולם!</p>
        </div>

        <!-- Divider -->
        <div class="td-divider"></div>

        <!-- Footer -->
        <div class="td-footer">
          <span class="td-status">
            <svg
              class="td-arrow"
              [class.td-arrow--rtl]="direction() === 'rtl'"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
            {{ direction() === 'ltr' ? 'Left to right' : 'Right to left' }}
          </span>
        </div>
      </demo-card>
    </ng-demo-wrapper>
  `,
  styles: `
    /* ── Toggle row ── */
    .td-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .td-label {
      font-size: 0.8125rem;
      color: #71717a;
    }

    /* ── Divider ── */
    .td-divider {
      height: 1px;
      background: #1f1f22;
      margin: 0.875rem 0 0;
    }

    /* ── Preview ── */
    .td-preview {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
      padding: 0.75rem;
      margin-top: 0.875rem;
      border: 1px dashed #27272a;
      border-radius: 8px;
      transition: text-align 0.2s ease;
    }

    .td-text {
      margin: 0;
      font-size: 0.8125rem;
      color: #a1a1aa;
      line-height: 1.5;
    }

    /* ── Footer ── */
    .td-footer {
      display: flex;
      align-items: center;
      padding-top: 0.75rem;
    }

    .td-status {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      font-size: 0.8125rem;
      color: #71717a;
    }

    /* ── Arrow ── */
    .td-arrow {
      flex-shrink: 0;
      transition: transform 0.3s ease;
    }

    .td-arrow--rtl {
      transform: scaleX(-1);
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

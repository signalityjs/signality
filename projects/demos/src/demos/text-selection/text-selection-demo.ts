import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { textSelection } from '@signality/core/elements/text-selection';
import { DemoButton, DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-text-selection',
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard, DemoButton],
  template: `
    <ng-demo-wrapper [code]="importCode">
      <div class="text-selection-card">
        <div class="selectable-text">
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua.
          </p>
          <p>
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
            commodo consequat.
          </p>
        </div>

        <demo-card>
          <div class="selection-info">
            <div class="info-row">
              <span class="info-label">Selected Text</span>
              <span class="info-value">{{ selection.text() || '(none)' }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Ranges Count</span>
              <span class="info-value">{{ selection.ranges().length }}</span>
            </div>
          </div>
        </demo-card>
      </div>
    </ng-demo-wrapper>
  `,
  styles: `
    .text-selection-card {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .selectable-text {
      background: #161618;
      border: 1px solid #3f3f46;
      border-radius: 8px;
      padding: 1rem;
      user-select: text;
    }

    .selectable-text p {
      margin: 0 0 0.75rem;
      font-size: 0.875rem;
      color: #e4e4e7;
      line-height: 1.6;
    }

    .selectable-text p:last-child {
      margin-bottom: 0;
    }

    .selection-info {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .info-label {
      font-size: 0.75rem;
      font-weight: 500;
      color: #a1a1aa;
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }

    .info-value {
      font-size: 0.875rem;
      font-weight: 500;
      color: #e4e4e7;
      font-family: 'SF Mono', Monaco, 'Courier New', monospace;
      max-width: 60%;
      word-break: break-all;
      text-align: right;
    }
  `,
})
export class TextSelectionDemo {
  readonly selection = textSelection();

  readonly importCode = `import { textSelection } from '@signality/core'`;
}

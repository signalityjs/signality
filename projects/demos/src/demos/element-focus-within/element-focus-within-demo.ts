import { ChangeDetectionStrategy, Component, ViewEncapsulation, viewChild } from '@angular/core';
import { elementFocusWithin } from '@signality/core/elements/element-focus-within';
import { DemoBadge, DemoCard, DemoInput, Wrapper } from '../../common';

@Component({
  selector: 'demo-element-focus-within',
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard, DemoBadge, DemoInput],
  template: `
    <ng-demo-wrapper [code]="importCode">
      <div class="focus-within-demo">
        <div #container class="focus-container" [class.focused]="isFocusedWithin()">
          <demo-input #input1 placeholder="Focus inside..." />
          <demo-input #input2 placeholder="Another input" />
        </div>

        <demo-card>
          <div class="status-row">
            <span class="status-label">Focus Within</span>
            <demo-badge [type]="isFocusedWithin() ? 'success' : 'neutral'">
              {{ isFocusedWithin() ? 'Inside' : 'Outside' }}
            </demo-badge>
          </div>
        </demo-card>
      </div>
    </ng-demo-wrapper>
  `,
  styles: `
    .focus-within-demo {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .focus-container {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      padding: 1rem;
      background: #161618;
      border: 1px dashed #3f3f46;
      border-radius: 8px;
      transition: all 0.2s ease;
    }

    .focus-container.focused {
      border-color: #22c55e;
      background: rgba(34, 197, 94, 0.05);
    }

    .status-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .status-label {
      font-size: 0.875rem;
      font-weight: 500;
      color: #a1a1aa;
    }
  `,
})
export class ElementFocusWithinDemo {
  readonly container = viewChild<HTMLElement>('container');
  readonly isFocusedWithin = elementFocusWithin(this.container);

  readonly importCode = `import { elementFocusWithin } from '@signality/core'`;
}

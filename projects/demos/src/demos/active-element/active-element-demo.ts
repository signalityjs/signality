import { ChangeDetectionStrategy, Component } from '@angular/core';
import { activeElement } from '@signality/core/elements/active-element';
import { DemoBadge, DemoButton, DemoCard, DemoInput, Wrapper } from '../../common';

@Component({
  selector: 'demo-active-element',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard, DemoButton, DemoBadge, DemoInput],
  template: `
    <ng-demo-wrapper [code]="importCode">
      <div class="active-element-demo">
        <div class="inputs-row">
          <demo-input placeholder="Focus me" />
          <demo-button variant="secondary">Focus me</demo-button>
        </div>

        <demo-card>
          <div class="status-row">
            <span class="status-label">Active Element</span>
            <demo-badge type="info">
              {{ activeEl() ? activeEl()?.tagName : 'None' }}
            </demo-badge>
          </div>
        </demo-card>
      </div>
    </ng-demo-wrapper>
  `,
  styles: `
    .active-element-demo {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .inputs-row {
      display: flex;
      gap: 0.5rem;
    }

    .inputs-row demo-input {
      flex: 1;
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
export class ActiveElementDemo {
  readonly activeEl = activeElement();

  readonly importCode = `import { activeElement } from '@signality/core'`;
}

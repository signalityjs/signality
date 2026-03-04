import { ChangeDetectionStrategy, Component, ViewEncapsulation, viewChild } from '@angular/core';
import { elementFocus } from '@signality/core/elements/element-focus';
import { DemoBadge, DemoButton, DemoCard, DemoInput, Wrapper } from '../../common';

@Component({
  selector: 'demo-element-focus',
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard, DemoBadge, DemoInput],
  template: `
    <ng-demo-wrapper [code]="importCode">
      <div class="focus-demo">
        <demo-card>
          <demo-input #inputEl placeholder="Focus me..." />
        </demo-card>

        <demo-card>
          <div class="focus-result">
            <span class="focus-label">Focus state:</span>
            <demo-badge [type]="isFocused() ? 'success' : 'neutral'">
              {{ isFocused() ? 'Focused' : 'Not focused' }}
            </demo-badge>
          </div>
        </demo-card>
      </div>
    </ng-demo-wrapper>
  `,
  styles: `
    .focus-demo {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .focus-result {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .focus-label {
      font-size: 0.875rem;
      font-weight: 500;
      color: #a1a1aa;
    }
  `,
})
export class ElementFocusDemo {
  readonly input = viewChild<HTMLInputElement>('input');
  readonly isFocused = elementFocus(this.input);

  readonly importCode = `import { elementFocus } from '@signality/core'`;
}

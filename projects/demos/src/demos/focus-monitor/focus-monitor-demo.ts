import { ChangeDetectionStrategy, Component, ViewEncapsulation, viewChild } from '@angular/core';
import { focusMonitor } from '@signality/cdk-interop/focus-monitor';
import { DemoBadge, DemoButton, DemoCard, DemoInput, Wrapper } from '../../common';

@Component({
  selector: 'demo-focus-monitor',
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard, DemoBadge, DemoButton, DemoInput],
  template: `
    <ng-demo-wrapper [code]="importCode">
      <div class="focus-monitor-demo">
        <demo-input #inputEl placeholder="Focus me..." />

        <demo-card>
          <div class="status-row">
            <span class="status-label">Focused</span>
            <demo-badge [type]="fm.isFocused() ? 'success' : 'neutral'">
              {{ fm.isFocused() ? 'Yes' : 'No' }}
            </demo-badge>
          </div>
        </demo-card>

        @if (fm.origin()) {
        <demo-card>
          <div class="origin-row">
            <span class="origin-label">Origin</span>
            <demo-badge [type]="getOriginType()">
              {{ fm.origin() }}
            </demo-badge>
          </div>
        </demo-card>
        }

        <div class="buttons-row">
          <demo-button variant="secondary" size="sm" (click)="fm.focusVia('program')">
            Programmatic
          </demo-button>
          <demo-button variant="secondary" size="sm" (click)="fm.focusVia('keyboard')">
            Keyboard
          </demo-button>
          <demo-button variant="secondary" size="sm" (click)="fm.focusVia('mouse')">
            Mouse
          </demo-button>
        </div>
      </div>
    </ng-demo-wrapper>
  `,
  styles: `
    .focus-monitor-demo {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
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

    .origin-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .origin-label {
      font-size: 0.875rem;
      font-weight: 500;
      color: #a1a1aa;
    }

    .buttons-row {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
  `,
})
export class FocusMonitorDemo {
  readonly inputEl = viewChild<HTMLInputElement>('inputEl');
  readonly fm = focusMonitor(this.inputEl);

  readonly importCode = `import { focusMonitor } from '@signality/cdk-interop'`;

  getOriginType(): 'success' | 'info' | 'warning' | 'neutral' {
    const origin = this.fm.origin();
    if (origin === 'keyboard') return 'info';
    if (origin === 'mouse') return 'warning';
    if (origin === 'touch') return 'warning';
    if (origin === 'program') return 'success';
    return 'neutral';
  }
}

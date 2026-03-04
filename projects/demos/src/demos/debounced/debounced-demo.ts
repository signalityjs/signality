import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { debounced } from '@signality/core/reactivity/debounced';
import { DemoCard, DemoInput, Wrapper } from '../../common';

@Component({
  selector: 'demo-debounced',
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard, DemoInput, FormsModule],
  template: `
    <ng-demo-wrapper [code]="importCode">
      <div class="debounced-card">
        <demo-input
          placeholder="Type something..."
          [ngModel]="inputText()"
          (ngModelChange)="onInputChange($event)"
        />

        <demo-card>
          <div class="values-grid">
            <div class="value-item">
              <span class="value-label">Immediate</span>
              <span class="value-text">{{ inputText() || '(empty)' }}</span>
            </div>
            <div class="value-item">
              <span class="value-label">Debounced (500ms)</span>
              <span class="value-text debounced">{{ debouncedValue() || '(empty)' }}</span>
            </div>
          </div>
        </demo-card>
      </div>
    </ng-demo-wrapper>
  `,
  styles: `
    .debounced-card {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .values-grid {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .value-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .value-label {
      font-size: 0.75rem;
      font-weight: 500;
      color: #a1a1aa;
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }

    .value-text {
      font-size: 0.9375rem;
      font-weight: 500;
      color: #e4e4e7;
      font-family: 'SF Mono', Monaco, 'Courier New', monospace;
    }

    .value-text.debounced {
      color: #DEB3EB;
    }
  `,
})
export class DebouncedDemo {
  readonly inputText = debounced('', 0);
  readonly debouncedValue = debounced('', 500);

  readonly importCode = `import { debounced } from '@signality/core'`;

  onInputChange(value: string): void {
    this.inputText.set(value);
    this.debouncedValue.set(value);
  }
}

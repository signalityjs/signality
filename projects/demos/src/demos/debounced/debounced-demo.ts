import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { debounced } from '@signality/core/reactivity/debounced';
import { DemoCard, DemoInput, Wrapper } from '../../common';

@Component({
  selector: 'demo-debounced',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard, DemoInput, FormsModule],
  template: `
    <ng-demo-wrapper [demoPath]="'debounced/debounced-demo'" [code]="importCode">
      <demo-card>
        <!-- Input -->
        <input
          demoInput
          placeholder="Type something…"
          [ngModel]="inputText()"
          (ngModelChange)="onInputChange($event)"
        />

        <!-- Divider -->
        <div class="db-divider"></div>

        <!-- Info rows -->
        <div class="db-rows">
          <div class="db-row">
            <span class="db-label">Immediate</span>
            <span class="db-value">{{ inputText() || '—' }}</span>
          </div>
          <div class="db-row">
            <span class="db-label">
              Debounced @if (isDebouncing()) {
              <svg
                class="db-spinner"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
              >
                <path d="M12 2a10 10 0 0 1 10 10" />
              </svg>
              }
            </span>
            <span class="db-value db-value--accent">{{ debouncedValue() || '—' }}</span>
          </div>
        </div>
      </demo-card>
    </ng-demo-wrapper>
  `,
  styles: `
    /* ── Divider ── */
    .db-divider {
      height: 1px;
      background: #1f1f22;
      margin: 0.875rem 0 0;
    }

    /* ── Info rows ── */
    .db-rows {
      display: flex;
      flex-direction: column;
      padding-top: 0.75rem;
    }

    .db-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.375rem 0;
    }

    .db-row + .db-row {
      border-top: 1px solid #1f1f22;
    }

    .db-label {
      font-size: 0.8125rem;
      color: #71717a;
      display: flex;
      align-items: center;
      gap: 0.375rem;
    }

    .db-right {
      display: flex;
      align-items: center;
      gap: 0.375rem;
    }

    /* ── Spinner ── */
    .db-spinner {
      color: #DEB3EB;
      opacity: 0.6;
      animation: dbSpin 0.8s linear infinite;
      flex-shrink: 0;
    }

    @keyframes dbSpin {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }

    /* ── Values ── */
    .db-value {
      font-size: 0.8125rem;
      color: #a1a1aa;
      max-width: 55%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .db-value--accent {
      color: #DEB3EB;
    }
  `,
})
export class DebouncedDemo {
  readonly inputText = debounced('', 0);
  readonly debouncedValue = debounced('', 500);

  readonly isDebouncing = computed(() => this.inputText() !== this.debouncedValue());

  readonly importCode = `import { debounced } from '@signality/core'`;

  onInputChange(value: string): void {
    this.inputText.set(value);
    this.debouncedValue.set(value);
  }
}

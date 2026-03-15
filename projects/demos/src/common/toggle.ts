import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { type WritableSignal } from '@angular/core';

export interface ToggleOption<T> {
  label: string;
  value: T;
}

@Component({
  selector: 'demo-toggle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="toggle">
      @for (option of options(); track option.value) {
      <button
        class="toggle-btn"
        [class.active]="isActive(option.value)"
        [disabled]="disabled()"
        (click)="handleClick(option.value)"
      >
        {{ option.label }}
      </button>
      }
    </div>
  `,
  styles: `
    .toggle {
      display: flex;
      border: 1px solid #27272a;
      border-radius: 8px;
      padding: 2px;
      gap: 1px;
    }

    .toggle-btn {
      padding: 0.3125rem 0.75rem;
      font-size: 0.75rem;
      font-weight: 500;
      color: #71717a;
      background: transparent;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      transition: color 0.15s ease, background 0.15s ease;
      white-space: nowrap;
    }

    .toggle-btn:hover:not(:disabled):not(.active) {
      color: #a1a1aa;
    }

    .toggle-btn.active {
      background: #27272a;
      color: #e4e4e7;
    }

    .toggle-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  `,
})
export class DemoToggle<T> {
  readonly options = input.required<ToggleOption<T>[]>();
  readonly value = input.required<WritableSignal<T>>();
  readonly disabled = input(false);

  readonly currentValue = computed(() => this.value()());

  isActive(optionValue: T): boolean {
    return this.currentValue() === optionValue;
  }

  handleClick(optionValue: T): void {
    if (!this.disabled()) {
      this.value().set(optionValue);
    }
  }
}

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
      background: #27272a;
      border-radius: 6px;
      padding: 2px;
    }

    .toggle-btn {
      padding: 0.375rem 0.75rem;
      font-size: 0.75rem;
      font-weight: 500;
      color: #a1a1aa;
      background: transparent;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: color 0.2s ease, background 0.2s ease;
    }

    .toggle-btn:hover:not(:disabled):not(.active) {
      color: #e4e4e7;
    }

    .toggle-btn.active {
      background: #DEB3EB;
      color: #0f0f11;
    }

    .toggle-btn.active:hover:not(:disabled) {
      background: #d4a3e4;
      color: #0f0f11;
    }

    .toggle-btn:disabled {
      opacity: 0.5;
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

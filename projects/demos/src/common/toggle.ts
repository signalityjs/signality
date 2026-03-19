import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { type WritableSignal } from '@angular/core';

export interface ToggleOption<T> {
  label: string;
  value: T;
}

@Component({
  selector: 'demo-toggle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './toggle.html',
  styleUrl: './toggle.scss',
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

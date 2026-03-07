import { ChangeDetectionStrategy, Component, input, forwardRef, signal } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, FormsModule } from '@angular/forms';

export type DemoInputSize = 'sm' | 'md';

@Component({
  selector: 'demo-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <input
      class="input"
      [class]="'input--' + size()"
      [type]="type()"
      [placeholder]="placeholder()"
      [disabled]="isDisabled()"
      [(ngModel)]="value"
      (ngModelChange)="onValueChange($event)"
      (blur)="onTouchedFn()"
    />
  `,
  styles: `
    :host {
      display: flex;
    }

    .input {
      width: 100%;
      background: #232125;
      border: 1px solid #3f3f46;
      border-radius: 6px;
      font-size: 0.875rem;
      color: #e4e4e7;
      font-family: inherit;
      transition: border-color 0.15s ease;
    }

    .input:focus {
      outline: none;
      border-color: #DEB3EB;
    }

    .input::placeholder {
      color: #71717a;
    }

    .input:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .input--sm {
      padding: 0.375rem 0.75rem;
    }

    .input--md {
      padding: 0.5rem 0.75rem;
    }
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DemoInput),
      multi: true,
    },
  ],
})
export class DemoInput implements ControlValueAccessor {
  readonly type = input<'text' | 'password' | 'email' | 'number'>('text');
  readonly placeholder = input('');
  readonly size = input<DemoInputSize>('md');
  readonly disabledInput = input(false);

  protected isDisabled = signal(false);

  value = '';

  private onChange: (value: string) => void = () => {
    /* empty */
  };
  private onTouched: () => void = () => {
    /* empty */
  };

  writeValue(value: string): void {
    this.value = value ?? '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }

  onValueChange(value: string): void {
    this.value = value;
    this.onChange(value);
  }

  onTouchedFn(): void {
    this.onTouched();
  }
}

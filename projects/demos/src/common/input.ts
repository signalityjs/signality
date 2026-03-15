import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  forwardRef,
  inject,
  input,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type DemoInputSize = 'sm' | 'md';

@Component({
  selector: 'input[demoInput]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: '',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DemoInput),
      multi: true,
    },
  ],
  host: {
    '[class.demo-input--sm]': `size() === 'sm'`,
    '[class.demo-input--md]': `size() === 'md'`,
    '(input)': '_handleInput($event)',
    '(blur)': '_onTouched()',
  },
  styles: `
    input[demoInput] {
      display: block;
      width: 100%;
      background: #18181b;
      border: 1px solid #27272a;
      border-radius: 6px;
      font-size: 0.875rem;
      color: #e4e4e7;
      font-family: inherit;
      transition: border-color 0.15s ease;
      box-sizing: border-box;
      padding: 0.5rem 0.75rem;
    }

    input[demoInput].demo-input--sm { padding: 0.375rem 0.75rem; }
    input[demoInput].demo-input--md { padding: 0.5rem 0.75rem; }

    input[demoInput]:focus {
      outline: none;
      border-color: rgba(222, 179, 235, 0.5);
    }

    input[demoInput]::placeholder {
      color: #71717a;
    }

    input[demoInput]:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `,
})
export class DemoInput implements ControlValueAccessor {
  readonly size = input<DemoInputSize>('md');

  private readonly el = inject<ElementRef<HTMLInputElement>>(ElementRef);

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  _onChange: (value: string) => void = () => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  _onTouched: () => void = () => {};

  writeValue(value: unknown): void {
    this.el.nativeElement.value = value == null ? '' : String(value);
  }

  registerOnChange(fn: (value: string) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.el.nativeElement.disabled = isDisabled;
  }

  _handleInput(event: Event): void {
    this._onChange((event.target as HTMLInputElement).value);
  }
}

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
  styleUrl: './input.scss',
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

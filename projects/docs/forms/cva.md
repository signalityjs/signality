---
source: https://github.com/signalityjs/signality/blob/main/projects/core/forms/cva/index.ts
---

# Cva

Reactive wrapper around Angular's Control Value Accessor (CVA) pattern. Provides signals for form control state (value, touched, disabled, invalid, etc.) and integrates seamlessly with both template-driven and reactive forms.

::: warning Signal Forms migration
This utility is particularly useful if you haven't migrated to [Signal Forms](https://angular.dev/guide/forms/signals/overview#why-signal-forms) yet and want to make building custom controls easier for template-driven or reactive forms. If you're already using Signal Forms, you may not need this utility.
:::

## Usage

Unlike traditional [Control Value Accessor](https://angular.dev/api/forms/ControlValueAccessor) implementations, you don't need to implement any interfaces or manually inject `NgControl`. The utility automatically detects and integrates with Angular's form system, making your component compatible with plain value models, template-driven forms using [`ngModel`](https://angular.dev/api/forms/NgModel), and reactive forms using [`formControl`](https://angular.dev/api/forms/FormControlDirective) or [`formControlName`](https://angular.dev/api/forms/FormControlName).

```angular-ts
import { Component, computed, model } from '@angular/core';
import { cva } from '@signality/core';

@Component({
  selector: 'app-currency-input',
  template: `
    <input
      type="text"
      [value]="displayValue()"
      [required]="cva.required()"
      (input)="handleInput($any($event.target).value)"
      (blur)="cva.touched.set(true)"
    />
  `,
})
export class CurrencyInput {
  readonly value = model<number>(0);
  readonly cva = cva({ value: this.value }); // [!code highlight]

  readonly displayValue = computed(() => {
    return this.value()
      .toFixed(2)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ','); // Shows "1,234.56"
  });

  handleInput(input: string) {
    const num = parseFloat(input.replace(/[^0-9.]/g, ''));
    if (!isNaN(num)) {
      this.value.set(num);
    }
  }
}
```

## Parameters

| Parameter | Type            | Description                                           |
|-----------|-----------------|-------------------------------------------------------|
| `options` | `CvaOptions<T>` | Configuration options (see [Options](#options) below) |

## Options

The `CvaOptions` extends `WithInjector`:

| Option     | Type                                                | Default         | Description                                         |
|------------|-----------------------------------------------------|-----------------|-----------------------------------------------------|
| `value`    | `WritableSignal<T>`                                 | -               | **Required.** The value signal for the form control |
| `touched`  | `WritableSignal<boolean>`                           | `signal(false)` | Custom touched state signal                         |
| `disabled` | `WritableSignal<boolean>`                           | `signal(false)` | Custom disabled state signal                        |
| `required` | `WritableSignal<boolean>`                           | `signal(false)` | Custom required state signal                        |
| `invalid`  | `WritableSignal<boolean>`                           | `signal(false)` | Custom invalid state signal                         |
| `pending`  | `WritableSignal<boolean>`                           | `signal(false)` | Custom pending state signal                         |
| `dirty`    | `WritableSignal<boolean>`                           | `signal(false)` | Custom dirty state signal                           |
| `errors`   | `WritableSignal<ValidationErrors \| null>`          | `signal(null)`  | Custom errors signal                                |
| `injector` | [`Injector`](https://angular.dev/api/core/Injector) | -               | Optional injector for DI context                    |

## Return Value

The `cva()` function returns a `CvaRef` object:

| Property   | Type                               | Description                               |
|------------|------------------------------------|-------------------------------------------|
| `value`    | `WritableSignal<T>`                | The value signal (same as provided)       |
| `touched`  | `WritableSignal<boolean>`          | Whether the control has been touched      |
| `disabled` | `Signal<boolean>`                  | Whether the control is disabled           |
| `required` | `Signal<boolean>`                  | Whether the control is required           |
| `invalid`  | `Signal<boolean>`                  | Whether the control is invalid            |
| `pending`  | `Signal<boolean>`                  | Whether the control is pending validation |
| `dirty`    | `Signal<boolean>`                  | Whether the control value has changed     |
| `errors`   | `Signal<ValidationErrors \| null>` | Validation errors or null                 |
| `reset`    | `() => void`                       | Reset the form control state              |

## Examples

### <svg xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle; margin-right: 5px; margin-bottom: 2px" width="21px" height="21px" viewBox="0 0 16 16" fill="none"><g clip-path="url(#clip0_2987_5863_cva)"><path d="M3.44362e-08 5.00053C-0.000135734 6.15784 0.401196 7.27935 1.13555 8.17382C1.86991 9.06829 2.89182 9.68032 4.027 9.90553C4.09238 9.18919 4.27621 8.48867 4.571 7.83253C3.695 7.53653 3.132 6.86453 3 5.91053H2.5V5.48453H2.966V5.05053C2.96533 5.00386 2.96667 4.95886 2.97 4.91553H2.5V4.48853H3.011C3.236 3.24053 4.213 2.50053 5.681 2.50053C5.997 2.50053 6.271 2.53153 6.5 2.58553V3.31853C6.23248 3.25939 5.95894 3.23187 5.685 3.23653C4.766 3.23653 4.147 3.70253 3.951 4.48853H5.868V4.91553H3.888C3.88533 4.9622 3.88433 5.0112 3.885 5.06253V5.48453H5.868V5.91153H3.93C4.048 6.51353 4.398 6.94153 4.935 7.14053C5.46154 6.26849 6.18567 5.53242 7.04897 4.99168C7.91228 4.45094 8.89059 4.12068 9.905 4.02753C9.65975 2.81304 8.97248 1.7328 7.97633 0.996044C6.98017 0.259291 5.74603 -0.0815315 4.51296 0.0395967C3.27989 0.160725 2.13566 0.735182 1.30191 1.65169C0.468163 2.5682 0.00423701 3.76153 3.44362e-08 5.00053ZM16 10.5005C16 11.9592 15.4205 13.3582 14.3891 14.3896C13.3576 15.4211 11.9587 16.0005 10.5 16.0005C9.04131 16.0005 7.64236 15.4211 6.61091 14.3896C5.57946 13.3582 5 11.9592 5 10.5005C5 9.04184 5.57946 7.64289 6.61091 6.61144C7.64236 5.57999 9.04131 5.00053 10.5 5.00053C11.9587 5.00053 13.3576 5.57999 14.3891 6.61144C15.4205 7.64289 16 9.04184 16 10.5005ZM8.25 11.8225C8.319 12.6575 8.996 13.3075 10.214 13.3845V14.0005H10.754V13.3805C12.013 13.2945 12.75 12.6405 12.75 11.6905C12.75 10.8255 12.187 10.3805 11.18 10.1505L10.754 10.0505V8.37453C11.294 8.43453 11.638 8.72153 11.72 9.11953H12.668C12.598 8.31553 11.889 7.68653 10.754 7.61753V7.00053H10.214V7.62953C9.138 7.73253 8.406 8.36153 8.406 9.25153C8.406 10.0385 8.95 10.5395 9.856 10.7445L10.214 10.8295V12.6095C9.66 12.5295 9.294 12.2335 9.211 11.8225H8.25ZM10.21 9.92753C9.678 9.80753 9.39 9.56353 9.39 9.19553C9.39 8.78553 9.701 8.47653 10.214 8.38653V9.92653H10.209L10.21 9.92753ZM10.832 10.9715C11.477 11.1165 11.775 11.3515 11.775 11.7675C11.775 12.2415 11.405 12.5675 10.755 12.6275V10.9535L10.832 10.9715Z" fill="#FFDD57"/></g><defs><clipPath id="clip0_2987_5863_cva"><rect width="16" height="16" fill="white"/></clipPath></defs></svg> Currency input

```angular-ts
import { Component, computed, model } from '@angular/core';
import { cva } from '@signality/core';

@Component({
  selector: 'app-currency-input',
  template: `
    <input
      type="text"
      [value]="displayValue()"
      [required]="cva.required()"
      [disabled]="cva.disabled()"
      (input)="handleInput($any($event.target).value)"
      (blur)="cva.touched.set(true)"
    />
    @if (cva.invalid() && cva.touched()) {
      <div class="error">
        @if (cva.errors()?.['required']) {
          <span>This field is required</span>
        }
      </div>
    }
  `,
})
export class CurrencyInput {
  readonly value = model<number>(0);
  readonly cva = cva({ value: this.value });

  readonly displayValue = computed(() => {
    return this.value()
      .toFixed(2)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  });

  handleInput(input: string) {
    const num = parseFloat(input.replace(/[^0-9.]/g, ''));
    if (!isNaN(num)) {
      this.value.set(num);
    }
  }
}
```

Usage with [reactive forms](https://angular.dev/guide/forms/reactive-forms):

```angular-ts
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  template: `
    <form [formGroup]="form">
      <app-currency-input formControlName="price"/>
    </form>
  `,
  imports: [ReactiveFormsModule, CurrencyInput],
})
export class ProductForm {
  readonly form = new FormGroup({
    price: new FormControl(0),
  });
}
```

### <svg xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle; margin-right: 5px; margin-bottom: 2px" width="21px" height="21px" viewBox="0 0 16 16" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M1 15V1H15V15H1ZM6.40556 11.8656L12.83 5.44111L11.7333 4.33667L6.49111 9.57889L4.5 7.3L3.33333 8.31111L6.40556 11.8656Z" fill="#9DCAFF"/></svg> Custom checkbox

```angular-ts
import { Component, model } from '@angular/core';
import { cva } from '@signality/core';

@Component({
  selector: 'app-custom-checkbox',
  template: `
    <label [class.disabled]="cva.disabled()">
      <input
        type="checkbox"
        [checked]="value()"
        [disabled]="cva.disabled()"
        (change)="value.set($any($event.target).checked)"
        (blur)="cva.touched.set(true)"
      />
      <span>{{ label }}</span>
    </label>
  `,
})
export class CustomCheckbox {
  readonly checked = model<boolean>(false);
  readonly label = 'Accept terms';
  readonly cva = cva({ value: this.checked });
}
```

Usage with [template-driven forms](https://angular.dev/guide/forms):

```angular-ts
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  template: `
    <form>
      <app-custom-checkbox [(ngModel)]="accepted" name="terms"/>
    </form>
  `,
  imports: [FormsModule, CustomCheckbox],
})
export class SignupForm {
  accepted = false;
}
```

## Integration with Angular Forms

The `cva()` utility automatically integrates with Angular's form system:

- **Reactive Forms**: works with `FormControl`, `FormControlName`, and `FormGroup`
- **Template-Driven Forms**: works with `NgModel`
- **Validators**: automatically syncs with `Validators.required`
- **State**: automatically syncs touched, disabled, invalid, pending, dirty, and errors states

## Type Definitions

```typescript
interface CvaRef<T> {
  readonly value: WritableSignal<T>;
  readonly touched: WritableSignal<boolean>;
  readonly disabled: Signal<boolean>;
  readonly required: Signal<boolean>;
  readonly invalid: Signal<boolean>;
  readonly pending: Signal<boolean>;
  readonly dirty: Signal<boolean>;
  readonly errors: Signal<ValidationErrors | null>;
  readonly reset: () => void;
}

type CvaOptions<T> = Omit<Partial<MakeWritable<CvaRef<T>>>, 'value'> &
  Pick<CvaRef<T>, 'value'> &
  WithInjector;

function cva<T>(options: CvaOptions<T>): CvaRef<T>;
```

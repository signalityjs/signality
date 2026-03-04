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

### Currency input

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

### Custom checkbox

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

- **Reactive Forms**: Works with `FormControl`, `FormControlName`, and `FormGroup`
- **Template-Driven Forms**: Works with `ngModel` and `NgModel`
- **Validators**: Automatically syncs with `Validators.required`
- **State Management**: Automatically syncs touched, disabled, invalid, pending, dirty, and errors states

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

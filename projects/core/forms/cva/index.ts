import {
  afterNextRender,
  type AfterRenderRef,
  inject,
  type Signal,
  signal,
  type WritableSignal,
} from '@angular/core';
import {
  NgControl,
  NgModel,
  RequiredValidator,
  type ValidationErrors,
  Validators,
} from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, map, startWith, switchMap, timer } from 'rxjs';
import { ALWAYS_FALSE_FN, setupContext } from '@signality/core/internal';
import type { WithInjector } from '@signality/core/types';
import { watcher } from '@signality/core/reactivity/watcher';

export type CvaOptions<T> = Omit<Partial<MakeWritable<CvaRef<T>>>, 'value'> &
  Pick<CvaRef<T>, 'value'> &
  WithInjector;

export interface CvaRef<T> {
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

/**
 * Reactive wrapper around the [Angular Forms](https://angular.dev/guide/forms) Control Value Accessor (CVA) pattern.
 * Integrates seamlessly with both template-driven and reactive forms.
 *
 * @param options - Configuration options including the value signal
 * @returns A CvaRef with reactive form control state signals
 *
 * @example
 * ```typescript
 * @Component({
 *   selector: 'app-currency-input',
 *   template: `
 *     <input
 *       type="text"
 *       [value]="displayValue()"
 *       [required]="cva.required()"
 *       (input)="handleInput($any($event.target).value)"
 *       (blur)="cva.touched.set(true)"
 *     />
 *   `,
 * })
 * export class CurrencyInput {
 *   readonly value = model(0);
 *   readonly cva = cva({ value: this.value });
 *
 *   readonly displayValue = computed(() => {
 *     return this.value()
 *       .toFixed(2)
 *       .replace(/\B(?=(\d{3})+(?!\d))/g, ','); // Shows "1,234.56"
 *   });
 *
 *   handleInput(input: string) {
 *     const num = parseFloat(input.replace(/[^0-9.]/g, ''));
 *     if (!isNaN(num)) {
 *       this.value.set(num);
 *     }
 *   }
 * }
 * ```
 */
export function cva<T>(options: CvaOptions<T>): CvaRef<T> {
  const { runInContext } = setupContext(options?.injector, cva);

  return runInContext(({ injector }) => {
    const ngControl = inject(NgControl, { self: true, optional: true });
    const ngModelRequired = inject(RequiredValidator, { self: true, optional: true });

    const initialValue = options.value();

    const {
      value,
      // Use ALWAYS_FALSE_FN to ensure touched signal always triggers watcher updates.
      // This is critical for controls with `updateOn: 'blur'` - when blur occurs, the control
      // may update its value, but control.touched remains true. Without forcing signal updates,
      // the watcher won't fire and the control won't properly synchronize its value after blur.
      touched = signal(false, { equal: ALWAYS_FALSE_FN }),
      disabled = signal(false),
      required = signal(false),
      invalid = signal(false),
      pending = signal(false),
      dirty = signal(false),
      errors = signal(null),
    } = options;

    const cvaRef: CvaRef<T> = {
      value,
      touched,
      disabled: disabled.asReadonly(),
      required: required.asReadonly(),
      invalid: invalid.asReadonly(),
      pending: pending.asReadonly(),
      dirty: dirty.asReadonly(),
      errors: errors.asReadonly(),
      reset: () => value.set(initialValue),
    };

    if (!ngControl) {
      return cvaRef;
    }

    let touchedFn: () => void;
    let updateFn: (v: T) => void;
    let scheduledModelUpdate: AfterRenderRef | null;

    const runModelUpdate = (fn: () => void) => {
      scheduledModelUpdate?.destroy();

      fn();

      scheduledModelUpdate = afterNextRender(
        () => {
          scheduledModelUpdate = null;
        },
        { injector }
      );
    };

    watcher(touched, isTouched => {
      if (isTouched) {
        touchedFn?.();
      }
    });

    watcher(value, v => {
      if (scheduledModelUpdate) {
        scheduledModelUpdate.destroy();
        scheduledModelUpdate = null;
      } else {
        updateFn?.(v);
      }
    });

    // the control instance isn't available immediately inside FormControl or FormControlName,
    // because they depend on [inputs]. That's why we schedule the subscription asynchronously.
    timer(0)
      .pipe(
        switchMap(() => {
          const { control } = ngControl;

          if (!control) {
            return EMPTY;
          }

          return control.events.pipe(
            startWith(null),
            map(() => control)
          );
        }),
        takeUntilDestroyed()
      )
      .subscribe(control => {
        required.set(
          control.hasValidator(Validators.required) ||
            // cannot compare references because `RequiredValidator` wraps `requiredValidator` fn
            // (https://github.com/angular/angular/blob/19.1.0/packages/forms/src/directives/validators.ts#L398)
            !!ngModelRequired?.required
        );
        touched.set(control.touched);
        invalid.set(control.invalid);
        pending.set(control.pending);
        errors.set(control.errors);
        dirty.set(control.dirty);
      });

    ngControl.valueAccessor = {
      writeValue: (rawValue: T | null) => {
        runModelUpdate(() => {
          // fix (https://github.com/angular/angular/issues/14988)
          const modelValue = ngControl instanceof NgModel ? ngControl.model : rawValue;
          value.set(modelValue);
        });
      },
      registerOnChange: fn => (updateFn = fn),
      registerOnTouched: fn => (touchedFn = fn),
      setDisabledState: isDisabled => disabled?.set(isDisabled),
    };

    return cvaRef;
  });
}

type MakeWritable<T extends object> = {
  [K in keyof T]: T[K] extends Signal<infer U> ? WritableSignal<U> : never;
};

import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { cva } from './index';

const stabilize = () => {
  jest.advanceTimersByTime(0);
  TestBed.tick();
};

describe(cva.name, () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('standalone (without form binding)', () => {
    @Component({ template: '' })
    class TestComponent {
      readonly value = signal('initial');
      readonly cvaRef = cva({ value: this.value });
    }

    const createComponent = () => {
      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      return fixture.componentInstance;
    };

    it('should expose the provided value signal', () => {
      const component = createComponent();

      expect(component.cvaRef.value()).toBe('initial');
    });

    it('should start with untouched, enabled, not required, valid, not pending, pristine state', () => {
      const component = createComponent();

      expect(component.cvaRef.touched()).toBe(false);
      expect(component.cvaRef.disabled()).toBe(false);
      expect(component.cvaRef.required()).toBe(false);
      expect(component.cvaRef.invalid()).toBe(false);
      expect(component.cvaRef.pending()).toBe(false);
      expect(component.cvaRef.dirty()).toBe(false);
      expect(component.cvaRef.errors()).toBeNull();
    });

    it('should update value when set externally', () => {
      const component = createComponent();

      component.cvaRef.value.set('updated');
      expect(component.cvaRef.value()).toBe('updated');
    });

    it('should restore initial value after reset', () => {
      const component = createComponent();

      component.cvaRef.value.set('changed');
      expect(component.cvaRef.value()).toBe('changed');

      component.cvaRef.reset();
      expect(component.cvaRef.value()).toBe('initial');
    });

    it('should always reset to the creation-time value regardless of how many changes occurred', () => {
      const component = createComponent();

      component.cvaRef.value.set('first');
      component.cvaRef.value.set('second');
      component.cvaRef.value.set('third');

      component.cvaRef.reset();
      expect(component.cvaRef.value()).toBe('initial');

      component.cvaRef.value.set('after-reset');
      component.cvaRef.reset();
      expect(component.cvaRef.value()).toBe('initial');
    });
  });

  describe('reactive forms', () => {
    @Component({
      selector: 'app-input',
      template: '<input [value]="cvaRef.value()" />',
    })
    class InputComponent {
      readonly value = signal('');
      readonly cvaRef = cva({ value: this.value });
    }

    @Component({
      template: '<app-input [formControl]="control" />',
      imports: [ReactiveFormsModule, InputComponent],
    })
    class HostComponent {
      readonly control = new FormControl('hello');
    }

    const createComponent = () => {
      const fixture = TestBed.createComponent(HostComponent);
      fixture.detectChanges();

      return {
        host: fixture.componentInstance,
        input: fixture.debugElement.children[0].componentInstance as InputComponent,
        detectChanges: () => {
          fixture.detectChanges();
        },
      };
    };

    it('should reflect the form control value on init', () => {
      const { input } = createComponent();

      expect(input.cvaRef.value()).toBe('hello');
    });

    it('should reflect value changes from the form control', () => {
      const { host, input, detectChanges } = createComponent();

      host.control.setValue('world');
      detectChanges();

      expect(input.cvaRef.value()).toBe('world');
    });

    it('should notify the form control when value changes internally', () => {
      const { host, input, detectChanges } = createComponent();

      input.cvaRef.value.set('from-inside');
      detectChanges();

      expect(host.control.value).toBe('from-inside');
    });

    it('should become disabled when the form control is disabled', () => {
      const { host, input, detectChanges } = createComponent();

      expect(input.cvaRef.disabled()).toBe(false);

      host.control.disable();
      detectChanges();

      expect(input.cvaRef.disabled()).toBe(true);
    });

    it('should mark the form control as touched when touched is set', () => {
      const { host, input, detectChanges } = createComponent();

      expect(input.cvaRef.touched()).toBe(false);

      input.cvaRef.touched.set(true);
      detectChanges();

      expect(host.control.touched).toBe(true);
    });

    it('should reflect invalid state when validation fails', () => {
      const { host, input, detectChanges } = createComponent();

      host.control.setValidators(Validators.minLength(100));
      host.control.updateValueAndValidity();
      detectChanges();

      expect(input.cvaRef.invalid()).toBe(true);
      expect(input.cvaRef.errors()).not.toBeNull();
    });

    it('should reflect required state when required validator is added', () => {
      const { host, input, detectChanges } = createComponent();

      host.control.setValidators(Validators.required);
      host.control.updateValueAndValidity();
      detectChanges();

      expect(input.cvaRef.required()).toBe(true);
    });

    it('should reflect dirty state after the control is marked dirty', () => {
      const { host, input, detectChanges } = createComponent();

      expect(input.cvaRef.dirty()).toBe(false);

      host.control.markAsDirty();
      host.control.updateValueAndValidity();
      detectChanges();

      expect(input.cvaRef.dirty()).toBe(true);
    });

    it('should restore initial value after reset', () => {
      const { input } = createComponent();

      expect(input.cvaRef.value()).toBe('hello');

      input.cvaRef.value.set('modified');
      stabilize();

      input.cvaRef.reset();
      stabilize();

      expect(input.cvaRef.value()).toBe('');
    });

    it('should become enabled again after being disabled and re-enabled', () => {
      const { host, input, detectChanges } = createComponent();

      host.control.disable();
      detectChanges();
      expect(input.cvaRef.disabled()).toBe(true);

      host.control.enable();
      detectChanges();
      expect(input.cvaRef.disabled()).toBe(false);
    });

    it('should reflect multiple validators and expose combined errors', () => {
      const { host, input, detectChanges } = createComponent();

      host.control.setValue('ab');
      host.control.setValidators([Validators.required, Validators.minLength(5)]);
      host.control.updateValueAndValidity();
      detectChanges();

      expect(input.cvaRef.required()).toBe(true);
      expect(input.cvaRef.invalid()).toBe(true);
      expect(input.cvaRef.errors()).toEqual({ minlength: { requiredLength: 5, actualLength: 2 } });
    });

    it('should no longer be required after validators are cleared', () => {
      const { host, input, detectChanges } = createComponent();

      host.control.setValidators(Validators.required);
      host.control.updateValueAndValidity();
      detectChanges();
      expect(input.cvaRef.required()).toBe(true);

      host.control.clearValidators();
      host.control.updateValueAndValidity();
      detectChanges();
      expect(input.cvaRef.required()).toBe(false);
      expect(input.cvaRef.invalid()).toBe(false);
    });
  });

  describe('reactive forms with updateOn: blur', () => {
    @Component({
      selector: 'app-input',
      template: '<input [value]="cvaRef.value()" />',
    })
    class BlurInputComponent {
      readonly value = signal('');
      readonly cvaRef = cva({ value: this.value });
    }

    @Component({
      template: '<app-input [formControl]="control" />',
      imports: [ReactiveFormsModule, BlurInputComponent],
    })
    class BlurHostComponent {
      readonly control = new FormControl('initial', { updateOn: 'blur' });
    }

    const createComponent = () => {
      const fixture = TestBed.createComponent(BlurHostComponent);
      fixture.detectChanges();
      stabilize();
      fixture.detectChanges();
      return {
        host: fixture.componentInstance,
        input: fixture.debugElement.children[0].componentInstance as BlurInputComponent,
        detectChanges: () => {
          fixture.detectChanges();
          stabilize();
        },
      };
    };

    it('should notify the form on each blur even when already touched', () => {
      const { host, input } = createComponent();

      input.cvaRef.touched.set(true);
      stabilize();
      expect(host.control.touched).toBe(true);

      input.cvaRef.touched.set(true);
      stabilize();
      expect(host.control.touched).toBe(true);
    });
  });

  describe('template-driven forms', () => {
    @Component({
      selector: 'app-input',
      template: '<input [value]="cvaRef.value()" />',
    })
    class NgModelInputComponent {
      readonly value = signal('');
      readonly cvaRef = cva({ value: this.value });
    }

    @Component({
      template: '<app-input [(ngModel)]="name" />',
      imports: [FormsModule, NgModelInputComponent],
    })
    class HostComponent {
      name = 'John';
    }

    const createComponent = () => {
      const fixture = TestBed.createComponent(HostComponent);
      fixture.detectChanges();
      stabilize();
      fixture.detectChanges();
      return {
        host: fixture.componentInstance,
        input: fixture.debugElement.children[0].componentInstance as NgModelInputComponent,
        detectChanges: () => {
          fixture.detectChanges();
          stabilize();
        },
      };
    };

    it('should reflect the bound model value', () => {
      const { input } = createComponent();

      expect(input.cvaRef.value()).toBe('John');
    });

    it('should update the model when value changes internally', () => {
      const { host, input } = createComponent();

      input.cvaRef.value.set('Jane');
      stabilize();

      expect(host.name).toBe('Jane');
    });
  });
});

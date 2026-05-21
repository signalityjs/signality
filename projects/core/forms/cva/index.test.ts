import { vi } from 'vitest';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { cva } from './index';

const stabilize = () => {
  vi.advanceTimersByTime(0);
  TestBed.tick();
};

describe(cva.name, () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('standalone (without form binding)', () => {
    @Component({ template: '' })
    class TestComponent {
      readonly value = signal('initial');
      readonly cva = cva({ value: this.value });
    }

    const createComponent = () => {
      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      return { fixture, cmp: fixture.componentInstance };
    };

    it('should expose the provided value signal', () => {
      const { cmp } = createComponent();

      expect(cmp.cva.value()).toBe('initial');
    });

    it('should start with untouched, enabled, not required, valid, not pending, pristine state', () => {
      const { cmp } = createComponent();

      expect(cmp.cva.touched()).toBe(false);
      expect(cmp.cva.disabled()).toBe(false);
      expect(cmp.cva.required()).toBe(false);
      expect(cmp.cva.invalid()).toBe(false);
      expect(cmp.cva.pending()).toBe(false);
      expect(cmp.cva.dirty()).toBe(false);
      expect(cmp.cva.errors()).toBeNull();
    });

    it('should update value when set externally', () => {
      const { cmp } = createComponent();

      cmp.value.set('updated');

      expect(cmp.cva.value()).toBe('updated');
    });

    describe('reset()', () => {
      it('should throw error when called before first change detection cycle completes', () => {
        const { cmp } = createComponent();

        expect(() => cmp.cva.reset()).toThrow();
      });

      it('should reset value to initial after initial value is resolved', async () => {
        const { cmp, fixture } = createComponent();

        await fixture.whenStable();

        expect(() => cmp.cva.reset()).not.toThrow();
        expect(cmp.cva.value()).toBe('initial');
      });

      it('should reset value that was modified after initialization', async () => {
        const { cmp, fixture } = createComponent();

        await fixture.whenStable();

        cmp.cva.value.set('modified');
        expect(cmp.cva.value()).toBe('modified');

        cmp.cva.reset();
        expect(cmp.cva.value()).toBe('initial');
      });
    });
  });

  describe('reactive forms', () => {
    @Component({
      selector: 'app-input',
      template: '<input [value]="cva.value()" />',
    })
    class Control {
      readonly value = signal('');
      readonly cva = cva({ value: this.value });
    }

    @Component({
      template: '<app-input [formControl]="control" />',
      imports: [ReactiveFormsModule, Control],
    })
    class HostComponent {
      readonly control = new FormControl('hello');
    }

    const createComponent = () => {
      const fixture = TestBed.createComponent(HostComponent);
      fixture.detectChanges();

      return {
        parent: fixture.componentInstance,
        child: fixture.debugElement.children[0].componentInstance as Control,
      };
    };

    it('should reflect the form control value on init', () => {
      const { child } = createComponent();

      expect(child.cva.value()).toBe('hello');
    });

    it('should reflect value changes from the form control', () => {
      const { parent, child } = createComponent();

      parent.control.setValue('world');
      stabilize();

      expect(child.cva.value()).toBe('world');
    });

    it('should notify the form control when value changes internally', () => {
      const { parent, child } = createComponent();

      child.cva.value.set('from-inside');
      stabilize();

      expect(parent.control.value).toBe('from-inside');
    });

    it('should become disabled when the form control is disabled', () => {
      const { parent, child } = createComponent();

      expect(child.cva.disabled()).toBe(false);

      parent.control.disable();
      stabilize();

      expect(child.cva.disabled()).toBe(true);
    });

    it('should reflect invalid state when validation fails', () => {
      const { parent, child } = createComponent();

      parent.control.setValidators(Validators.minLength(100));
      parent.control.updateValueAndValidity();
      stabilize();

      expect(child.cva.invalid()).toBe(true);
      expect(child.cva.errors()).not.toBeNull();
    });

    it('should reflect required state when required validator is added', () => {
      const { parent, child } = createComponent();

      parent.control.setValidators(Validators.required);
      parent.control.updateValueAndValidity();
      stabilize();

      expect(child.cva.required()).toBe(true);
    });

    it('should reflect dirty state after the control is marked dirty', () => {
      const { parent, child } = createComponent();

      expect(child.cva.dirty()).toBe(false);

      parent.control.markAsDirty();
      parent.control.updateValueAndValidity();
      stabilize();

      expect(child.cva.dirty()).toBe(true);
    });

    it('should become enabled again after being disabled and re-enabled', () => {
      const { parent, child } = createComponent();

      parent.control.disable();
      stabilize();
      expect(child.cva.disabled()).toBe(true);

      parent.control.enable();
      stabilize();
      expect(child.cva.disabled()).toBe(false);
    });

    it('should reflect multiple validators and expose combined errors', () => {
      const { parent, child } = createComponent();

      parent.control.setValue('ab');
      parent.control.setValidators([Validators.required, Validators.minLength(5)]);
      parent.control.updateValueAndValidity();
      stabilize();

      expect(child.cva.required()).toBe(true);
      expect(child.cva.invalid()).toBe(true);
      expect(child.cva.errors()).toEqual({ minlength: { requiredLength: 5, actualLength: 2 } });
    });

    it('should no longer be required after validators are cleared', () => {
      const { parent, child } = createComponent();

      parent.control.setValidators(Validators.required);
      parent.control.updateValueAndValidity();
      stabilize();
      expect(child.cva.required()).toBe(true);

      parent.control.clearValidators();
      parent.control.updateValueAndValidity();
      stabilize();
      expect(child.cva.required()).toBe(false);
      expect(child.cva.invalid()).toBe(false);
    });
  });

  describe('template-driven forms', () => {
    @Component({
      selector: 'app-input',
      template: '<input [value]="cva.value()" />',
    })
    class Control {
      readonly value = signal('');
      readonly cva = cva({ value: this.value });
    }

    @Component({
      template: '<app-input [(ngModel)]="name" />',
      imports: [FormsModule, Control],
    })
    class HostComponent {
      name = 'John';
    }

    const createComponent = () => {
      const fixture = TestBed.createComponent(HostComponent);
      fixture.detectChanges();
      return {
        parent: fixture.componentInstance,
        child: fixture.debugElement.children[0].componentInstance as Control,
      };
    };

    it('should reflect the bound model value', () => {
      const { child } = createComponent();

      expect(child.cva.value()).toBe('John');
    });

    it('should update the model when value changes internally', () => {
      const { parent, child } = createComponent();

      child.cva.value.set('Jane');
      stabilize();

      expect(parent.name).toBe('Jane');
    });
  });
});

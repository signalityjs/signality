import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type DemoButtonVariant = 'primary' | 'secondary' | 'ghost';
export type DemoButtonSize = 'sm' | 'md';

@Component({
  selector: 'demo-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      class="btn"
      [class]="'btn--' + variant() + ' btn--' + size()"
      [disabled]="disabled()"
      (click)="handleClick($event)"
    >
      <ng-content />
    </button>
  `,
  styles: `
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      font-family: inherit;
      font-weight: 500;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.15s ease;
      border: 1px solid transparent;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Sizes */
    .btn--sm {
      padding: 0.375rem 0.75rem;
      font-size: 0.8125rem;
    }

    .btn--md {
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
    }

    /* Variants */
    .btn--primary {
      background: #DEB3EB;
      color: #0f0f11;
    }

    .btn--primary:hover:not(:disabled) {
      background: #d4a3e4;
    }

    .btn--secondary {
      background: transparent;
      color: #e4e4e7;
      border-color: #27272a;
    }

    .btn--secondary:hover:not(:disabled) {
      background: #1a1a1d;
      border-color: #3f3f46;
    }

    .btn--ghost {
      background: transparent;
      color: #a1a1aa;
    }

    .btn--ghost:hover:not(:disabled) {
      color: #e4e4e7;
      background: rgba(255, 255, 255, 0.05);
    }
  `,
})
export class DemoButton {
  readonly variant = input<DemoButtonVariant>('secondary');
  readonly size = input<DemoButtonSize>('md');
  readonly disabled = input(false);

  handleClick(event: Event): void {
    if (this.disabled()) {
      event.preventDefault();
      event.stopPropagation();
    }
  }
}

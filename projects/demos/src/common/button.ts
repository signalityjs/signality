import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type DemoButtonVariant = 'primary' | 'secondary' | 'ghost';
export type DemoButtonSize = 'sm' | 'md';

@Component({
  selector: 'demo-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './button.html',
  styleUrl: './button.scss',
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

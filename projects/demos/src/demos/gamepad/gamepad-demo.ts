import { ChangeDetectionStrategy, Component } from '@angular/core';
import { gamepad } from '@signality/core';
import { DemoBadge, DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-gamepad',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard, DemoBadge],
  templateUrl: './gamepad-demo.html',
  styleUrl: './gamepad-demo.scss',
})
export class GamepadDemo {
  readonly importCode = `import { gamepad } from '@signality/core'`;

  readonly gp = gamepad();

  getAxisPercent(value: number): number {
    return Math.abs(value) * 50;
  }
}

import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'demo-not-supported',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './not-supported.html',
  styleUrl: './not-supported.scss',
})
export class DemoNotSupported {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly hints = input<string[]>([]);
}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { breakpoints } from '@signality/core';
import { DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-breakpoints',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard],
  templateUrl: './breakpoints-demo.html',
  styleUrl: './breakpoints-demo.scss',
})
export class BreakpointsDemo {
  readonly importCode = `import { breakpoints } from '@signality/core'`;

  readonly bp = breakpoints({
    xs: '(max-width: 639px)',
    sm: '(min-width: 640px) and (max-width: 767px)',
    md: '(min-width: 768px) and (max-width: 1023px)',
    lg: '(min-width: 1024px) and (max-width: 1279px)',
    xl: '(min-width: 1280px)',
  });

  readonly breakpointList = [
    { name: 'xs', range: '≤ 639px', signal: this.bp.xs },
    { name: 'sm', range: '640 – 767px', signal: this.bp.sm },
    { name: 'md', range: '768 – 1023px', signal: this.bp.md },
    { name: 'lg', range: '1024 – 1279px', signal: this.bp.lg },
    { name: 'xl', range: '≥ 1280px', signal: this.bp.xl },
  ];
}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { breakpoints } from '@signality/core/browser/breakpoints';
import { DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-breakpoints',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard],
  template: `
    <ng-demo-wrapper [demoPath]="'breakpoints/breakpoints-demo'" [code]="importCode">
      <demo-card>
        <div class="bp-list">
          @for (item of breakpointList; track item.name; let last = $last) {
          <div class="bp-row">
            <span class="bp-dot" [class.bp-dot--on]="item.signal()"></span>
            <span class="bp-query" [class.bp-query--on]="item.signal()">{{ item.name }}</span>
            <span class="bp-value" [class.bp-value--on]="item.signal()">{{ item.range }}</span>
          </div>
          @if (!last) {
          <div class="bp-divider"></div>
          } }
        </div>
      </demo-card>
    </ng-demo-wrapper>
  `,
  styles: `
    .bp-list {
      display: flex;
      flex-direction: column;
    }

    /* ── Row ── */
    .bp-row {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      padding: 0.625rem 0;
    }

    .bp-row:first-child { padding-top: 0; }
    .bp-row:last-child  { padding-bottom: 0; }

    /* ── Dot ── */
    .bp-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #3f3f46;
      flex-shrink: 0;
      transition: background 0.3s ease, box-shadow 0.3s ease;
    }

    .bp-dot--on {
      background: #DEB3EB;
      box-shadow: 0 0 0 3px rgba(222, 179, 235, 0.18);
    }

    /* ── Query label ── */
    .bp-query {
      font-size: 0.8125rem;
      font-weight: 400;
      color: #71717a;
      width: 1.75rem;
      flex-shrink: 0;
      transition: color 0.3s ease;
    }

    .bp-query--on {
      color: #DEB3EB;
    }

    /* ── Value ── */
    .bp-value {
      font-size: 0.8125rem;
      font-weight: 400;
      color: #3f3f46;
      flex: 1;
      text-align: right;
      font-variant-numeric: tabular-nums;
      transition: color 0.3s ease;
    }

    .bp-value--on {
      color: #e4e4e7;
    }

    /* ── Divider ── */
    .bp-divider {
      height: 1px;
      background: #1f1f22;
    }

  `,
})
export class BreakpointsDemo {
  readonly bp = breakpoints({
    xs: '(max-width: 639px)',
    sm: '(min-width: 640px) and (max-width: 767px)',
    md: '(min-width: 768px) and (max-width: 1023px)',
    lg: '(min-width: 1024px) and (max-width: 1279px)',
    xl: '(min-width: 1280px)',
  });

  readonly importCode = `import { breakpoints } from '@signality/core'`;

  readonly breakpointList = [
    { name: 'xs', range: '≤ 639px', signal: this.bp.xs },
    { name: 'sm', range: '640 – 767px', signal: this.bp.sm },
    { name: 'md', range: '768 – 1023px', signal: this.bp.md },
    { name: 'lg', range: '1024 – 1279px', signal: this.bp.lg },
    { name: 'xl', range: '≥ 1280px', signal: this.bp.xl },
  ];
}

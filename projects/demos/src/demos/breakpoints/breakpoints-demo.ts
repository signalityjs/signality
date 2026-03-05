import { ChangeDetectionStrategy, Component } from '@angular/core';
import { breakpoints } from '@signality/core/browser/breakpoints';
import { DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-breakpoints',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard],
  template: `
    <ng-demo-wrapper [code]="importCode">
      <div class="breakpoints-card">
        <demo-card>
          <div class="current-breakpoint">
            <span class="breakpoint-label">Current Breakpoint</span>
            <span class="breakpoint-value">{{ currentBreakpoint() }}</span>
          </div>
        </demo-card>

        <demo-card>
          <div class="breakpoints-list">
            <span class="section-label">All Breakpoints</span>
            <div class="breakpoint-items">
              @for (bp of breakpointList; track bp.name) {
              <div class="breakpoint-item" [class.active]="bp.signal()">
                <span class="bp-name">{{ bp.name }}</span>
                <span class="bp-query">{{ bp.query }}</span>
                <span class="bp-status" [class.active]="bp.signal()">
                  {{ bp.signal() ? 'Active' : 'Inactive' }}
                </span>
              </div>
              }
            </div>
          </div>
        </demo-card>
      </div>
    </ng-demo-wrapper>
  `,
  styles: `
    .breakpoints-card {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .current-breakpoint {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem 0;
    }

    .breakpoint-label {
      font-size: 0.75rem;
      font-weight: 500;
      color: #a1a1aa;
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }

    .breakpoint-value {
      font-size: 2rem;
      font-weight: 700;
      color: #DEB3EB;
    }

    .breakpoints-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .section-label {
      font-size: 0.75rem;
      font-weight: 500;
      color: #a1a1aa;
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }

    .breakpoint-items {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .breakpoint-item {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 1rem;
      align-items: center;
      padding: 0.5rem 0.75rem;
      background: #161618;
      border-radius: 6px;
      border: 1px solid transparent;
    }

    .breakpoint-item.active {
      border-color: #DEB3EB;
    }

    .bp-name {
      font-size: 0.875rem;
      font-weight: 600;
      color: #e4e4e7;
    }

    .bp-query {
      font-size: 0.815rem;
      color: #71717a;
      text-align: center;
    }

    .bp-status {
      inline-size: fit-content;
      margin-left: auto;
      font-size: 0.75rem;
      color: #71717a;
      padding: 0.125rem 0.5rem;
      border-radius: 999px;
      background: #232125;
    }

    .bp-status.active {
      color: #22c55e;
      background: rgba(34, 197, 94, 0.1);
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

  breakpointList = [
    { name: 'xs', query: '(max-width: 639px)', signal: this.bp.xs },
    { name: 'sm', query: '(640px - 767px)', signal: this.bp.sm },
    { name: 'md', query: '(768px - 1023px)', signal: this.bp.md },
    { name: 'lg', query: '(1024px - 1279px)', signal: this.bp.lg },
    { name: 'xl', query: '(min-width: 1280px)', signal: this.bp.xl },
  ];

  currentBreakpoint(): string {
    const current = this.bp.current();
    return current.length > 0 ? current[0].toUpperCase() : 'None';
  }
}

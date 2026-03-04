import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { mediaQuery } from '@signality/core/browser/media-query';
import { DemoBadge, DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-media-query',
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard, DemoBadge],
  template: `
    <ng-demo-wrapper [code]="importCode">
      <div class="query-card">
        <demo-card>
          <div class="query-item">
            <span class="query-label">prefers-color-scheme</span>
            <demo-badge [type]="prefersDark() ? 'success' : 'neutral'">
              {{ prefersDark() ? 'dark' : 'light' }}
            </demo-badge>
          </div>
        </demo-card>

        <demo-card>
          <div class="query-item">
            <span class="query-label">prefers-reduced-motion</span>
            <demo-badge [type]="prefersReducedMotion() ? 'success' : 'neutral'">
              {{ prefersReducedMotion() ? 'reduce' : 'no-preference' }}
            </demo-badge>
          </div>
        </demo-card>

        <demo-card>
          <div class="query-item">
            <span class="query-label">prefers-reduced-data</span>
            <demo-badge [type]="prefersReducedData() ? 'success' : 'neutral'">
              {{ prefersReducedData() ? 'reduce' : 'no-preference' }}
            </demo-badge>
          </div>
        </demo-card>
      </div>
    </ng-demo-wrapper>
  `,
  styles: `
    .query-card {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .query-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .query-label {
      font-size: 0.875rem;
      color: #e4e4e7;
      font-weight: 500;
    }
  `,
})
export class MediaQueryDemo {
  readonly prefersDark = mediaQuery('(prefers-color-scheme: dark)');
  readonly prefersReducedMotion = mediaQuery('(prefers-reduced-motion: reduce)');
  readonly prefersReducedData = mediaQuery('(prefers-reduced-data: reduce)');

  readonly importCode = `import { mediaQuery } from '@signality/core'`;
}

import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { mediaQuery } from '@signality/core/browser/media-query';
import { DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-media-query',
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard],
  template: `
    <ng-demo-wrapper [code]="importCode">
      <div class="query-card">
        <demo-card>
          <div class="queries-list">
            <div class="query-item">
              <span class="query-name">prefers-color-scheme</span>
              <span class="query-value" [class.active]="prefersDark()">dark</span>
            </div>
            <div class="query-item">
              <span class="query-name">prefers-reduced-motion</span>
              <span class="query-value" [class.active]="prefersReducedMotion()">reduce</span>
            </div>
            <div class="query-item">
              <span class="query-name">prefers-reduced-data</span>
              <span class="query-value" [class.active]="prefersReducedData()">reduce</span>
            </div>
            <div class="query-item">
              <span class="query-name">hover</span>
              <span class="query-value" [class.active]="hover()">hover</span>
            </div>
            <div class="query-item">
              <span class="query-name">pointer</span>
              <span class="query-value" [class.active]="pointer()">fine</span>
            </div>
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

    .queries-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .query-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .query-name {
      font-size: 0.75rem;
      color: #a1a1aa;
    }

    .query-value {
      font-size: 0.75rem;
      font-weight: 500;
      color: #71717a;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      background: #27272a;
    }

    .query-value.active {
      color: #22c55e;
      background: rgba(34, 197, 94, 0.15);
    }
  `,
})
export class MediaQueryDemo {
  readonly prefersDark = mediaQuery('(prefers-color-scheme: dark)');
  readonly prefersReducedMotion = mediaQuery('(prefers-reduced-motion: reduce)');
  readonly prefersReducedData = mediaQuery('(prefers-reduced-data: reduce)');
  readonly hover = mediaQuery('(hover: hover)');
  readonly pointer = mediaQuery('(pointer: fine)');

  readonly importCode = `import { mediaQuery } from '@signality/core'`;
}

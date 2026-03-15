import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { mediaQuery } from '@signality/core/browser/media-query';
import { DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-media-query',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard],
  template: `
    <ng-demo-wrapper [demoPath]="'media-query/media-query-demo'" [code]="importCode">
      <demo-card>
        <div class="mq-list">
          <div class="mq-row">
            <span class="mq-dot" [class.mq-dot--on]="prefersDark()"></span>
            <span class="mq-query">prefers-color-scheme</span>
            <span class="mq-value" [class.mq-value--on]="prefersDark()">
              {{ prefersDark() ? 'dark' : 'light' }}
            </span>
          </div>

          <div class="mq-divider"></div>

          <div class="mq-row">
            <span class="mq-dot" [class.mq-dot--on]="prefersReducedMotion()"></span>
            <span class="mq-query">prefers-reduced-motion</span>
            <span class="mq-value" [class.mq-value--on]="prefersReducedMotion()">
              {{ prefersReducedMotion() ? 'reduce' : 'no-preference' }}
            </span>
          </div>

          <div class="mq-divider"></div>

          <div class="mq-row">
            <span class="mq-dot" [class.mq-dot--on]="isPortrait()"></span>
            <span class="mq-query">orientation</span>
            <span class="mq-value" [class.mq-value--on]="isPortrait()">
              {{ isPortrait() ? 'portrait' : 'landscape' }}
            </span>
          </div>

          <div class="mq-divider"></div>

          <div class="mq-row">
            <span class="mq-dot" [class.mq-dot--on]="hasHover()"></span>
            <span class="mq-query">hover</span>
            <span class="mq-value" [class.mq-value--on]="hasHover()">
              {{ hasHover() ? 'hover' : 'none' }}
            </span>
          </div>

          <div class="mq-divider"></div>

          <div class="mq-row">
            <span class="mq-dot" [class.mq-dot--on]="isCoarsePointer()"></span>
            <span class="mq-query">pointer</span>
            <span class="mq-value" [class.mq-value--on]="isCoarsePointer()">
              {{ isCoarsePointer() ? 'coarse' : 'fine' }}
            </span>
          </div>
        </div>
      </demo-card>
    </ng-demo-wrapper>
  `,
  styles: `
    .mq-list {
      display: flex;
      flex-direction: column;
    }

    /* ── Row ── */
    .mq-row {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      padding: 0.625rem 0;
    }

    .mq-row:first-child { padding-top: 0; }
    .mq-row:last-child  { padding-bottom: 0; }

    /* ── Dot ── */
    .mq-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #3f3f46;
      flex-shrink: 0;
      transition: background 0.3s ease, box-shadow 0.3s ease;
    }

    .mq-dot--on {
      background: #22c55e;
      box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.18);
    }

    /* ── Query label ── */
    .mq-query {
      font-size: 0.8125rem;
      font-weight: 400;
      color: #a1a1aa;
      flex: 1;
    }

    /* ── Value ── */
    .mq-value {
      font-size: 0.8125rem;
      font-weight: 500;
      color: #52525b;
      text-align: right;
      transition: color 0.3s ease;
      flex-shrink: 0;
    }

    .mq-value--on {
      color: #e4e4e7;
    }

    /* ── Divider ── */
    .mq-divider {
      height: 1px;
      background: #1f1f22;
    }
  `,
})
export class MediaQueryDemo {
  readonly prefersDark = mediaQuery('(prefers-color-scheme: dark)');
  readonly prefersReducedMotion = mediaQuery('(prefers-reduced-motion: reduce)');
  readonly isPortrait = mediaQuery('(orientation: portrait)');
  readonly hasHover = mediaQuery('(hover: hover)');
  readonly isCoarsePointer = mediaQuery('(pointer: coarse)');

  readonly importCode = `import { mediaQuery } from '@signality/core'`;
}

import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'demo-not-supported',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="unsupported">
      <div class="unsupported-icon">
        <ng-content />
      </div>
      <div class="unsupported-body">
        <h3 class="unsupported-title">{{ title() }}</h3>
        <p class="unsupported-desc">{{ description() }}</p>
      </div>
      @if (hints().length) {
      <div class="unsupported-hints">
        @for (hint of hints(); track hint) {
        <span class="unsupported-hint">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="6" stroke="currentColor" stroke-width="1" />
          </svg>
          {{ hint }}
        </span>
        }
      </div>
      }
    </div>
  `,
  styles: `
    .unsupported {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      padding: 0.5rem 0 1rem;
    }

    .unsupported-icon {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: rgba(161, 161, 170, 0.06);
      border: 1px solid rgba(161, 161, 170, 0.12);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #71717a;
    }

    .unsupported-body {
      text-align: center;
    }

    .unsupported-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: #9a9aa2;
      margin: 0 0 0.375rem 0;
      letter-spacing: -0.01em;
    }

    .unsupported-desc {
      font-size: 0.8125rem;
      font-weight: 400;
      color: #71717a;
      margin: 0;
      text-align: center;
      line-height: 1.5;
      max-width: 260px;
    }

    .unsupported-hints {
      display: flex;
      gap: 1rem;
      margin-top: 0.25rem;
    }

    .unsupported-hint {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      font-size: 0.725rem;
      color: #71717a;
      font-weight: 500;
    }
  `,
})
export class DemoNotSupported {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly hints = input<string[]>([]);
}

import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { activeElement } from '@signality/core/elements/active-element';
import { DemoCard, DemoInput, Wrapper } from '../../common';

@Component({
  selector: 'demo-active-element',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard, DemoInput],
  template: `
    <ng-demo-wrapper [demoPath]="'active-element/active-element-demo'" [code]="importCode">
      <demo-card>
        <!-- Interactive elements -->
        <div class="ae-row">
          <input demoInput class="ae-input" placeholder="Focus me…" />
          <button class="ae-btn">Button</button>
        </div>

        <!-- Divider + footer -->
        <div class="ae-divider"></div>
        <div class="ae-footer">
          <span class="ae-label">Active element</span>
          <span class="ae-value" [class.ae-value--active]="isFocused()">
            {{ isFocused() ? activeEl()!.tagName : '—' }}
          </span>
        </div>
      </demo-card>
    </ng-demo-wrapper>
  `,
  styles: `
    /* ── Row ── */
    .ae-row {
      display: flex;
      gap: 0.5rem;
    }

    .ae-input {
      flex: 1;
    }

    .ae-btn {
      font-size: 0.875rem;
      font-family: inherit;
      font-weight: 500;
      color: #a1a1aa;
      background: transparent;
      border: 1px solid #27272a;
      border-radius: 6px;
      padding: 0.375rem 0.875rem;
      cursor: pointer;
      white-space: nowrap;
      transition: border-color 0.15s ease, color 0.15s ease;
    }

    .ae-btn:hover {
      border-color: #3f3f46;
      color: #e4e4e7;
    }

    .ae-btn:focus {
      outline: none;
      border-color: rgba(222, 179, 235, 0.5);
    }

    /* ── Divider ── */
    .ae-divider {
      height: 1px;
      background: #1f1f22;
      margin: 0.875rem 0 0;
    }

    /* ── Footer ── */
    .ae-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 0.75rem;
    }

    .ae-label {
      font-size: 0.8125rem;
      color: #71717a;
    }

    .ae-value {
      font-family: 'SF Mono', 'Fira Code', 'Roboto Mono', monospace;
      font-size: 0.75rem;
      color: #3f3f46;
      font-weight: 400;
      transition: color 0.2s ease;
    }

    .ae-value--active {
      color: #a1a1aa;
    }
  `,
})
export class ActiveElementDemo {
  readonly activeEl = activeElement();
  readonly isFocused = computed(() => {
    const el = this.activeEl();
    return !!el && el.tagName !== 'BODY';
  });

  readonly importCode = `import { activeElement } from '@signality/core'`;
}

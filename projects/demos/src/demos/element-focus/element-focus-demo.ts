import { ChangeDetectionStrategy, Component, ElementRef, viewChild } from '@angular/core';
import { elementFocus } from '@signality/core/elements/element-focus';
import { DemoCard, DemoInput, Wrapper } from '../../common';

@Component({
  selector: 'demo-element-focus',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard, DemoInput],
  template: `
    <ng-demo-wrapper [demoPath]="'element-focus/element-focus-demo'" [code]="importCode">
      <demo-card>
        <!-- Input -->
        <input #inputEl demoInput placeholder="Click to focus…" />

        <!-- Divider -->
        <div class="ef-divider"></div>

        <!-- Footer -->
        <div class="ef-footer">
          <span class="ef-status" [class.ef-status--active]="isFocused()">
            <span class="ef-dot" [class.ef-dot--active]="isFocused()"></span>
            {{ isFocused() ? 'Focused' : 'No focus' }}
          </span>
        </div>
      </demo-card>
    </ng-demo-wrapper>
  `,
  styles: `
    /* ── Divider ── */
    .ef-divider {
      height: 1px;
      background: #1f1f22;
      margin: 0.875rem 0 0;
    }

    /* ── Footer ── */
    .ef-footer {
      display: flex;
      align-items: center;
      padding-top: 0.75rem;
    }

    .ef-status {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8125rem;
      color: #52525b;
      transition: color 0.25s ease;
    }

    .ef-status--active {
      color: #a1a1aa;
    }

    /* ── Status dot ── */
    .ef-dot {
      position: relative;
      width: 6px;
      height: 6px;
      flex-shrink: 0;
    }

    .ef-dot::before,
    .ef-dot::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: #3f3f46;
      transition: background 0.25s ease;
    }

    .ef-dot--active::before,
    .ef-dot--active::after {
      background: #22c55e;
    }

    .ef-dot--active::after {
      animation: efPulse 2s ease-out infinite;
    }

    @keyframes efPulse {
      0%   { transform: scale(1); opacity: 0.6; }
      100% { transform: scale(3); opacity: 0; }
    }
  `,
})
export class ElementFocusDemo {
  readonly inputEl = viewChild('inputEl', { read: ElementRef });
  readonly isFocused = elementFocus(this.inputEl);

  readonly importCode = `import { elementFocus } from '@signality/core'`;
}

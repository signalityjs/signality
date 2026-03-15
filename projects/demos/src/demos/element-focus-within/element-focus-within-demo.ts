import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { elementFocusWithin } from '@signality/core/elements/element-focus-within';
import { DemoCard, DemoInput, Wrapper } from '../../common';

@Component({
  selector: 'demo-element-focus-within',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard, DemoInput],
  template: `
    <ng-demo-wrapper
      [demoPath]="'element-focus-within/element-focus-within-demo'"
      [code]="importCode"
    >
      <demo-card>
        <!-- Observed container -->
        <div #container class="fw-zone" [class.fw-zone--active]="isFocusedWithin()">
          <input demoInput placeholder="Focus inside…" />
          <input demoInput placeholder="Or here…" />
        </div>

        <!-- Divider -->
        <div class="fw-divider"></div>

        <!-- Footer -->
        <div class="fw-footer">
          <span class="fw-status" [class.fw-status--active]="isFocusedWithin()">
            <span class="fw-dot" [class.fw-dot--active]="isFocusedWithin()"></span>
            {{ isFocusedWithin() ? 'Focus within' : 'No focus' }}
          </span>
        </div>
      </demo-card>
    </ng-demo-wrapper>
  `,
  styles: `
    /* ── Zone ── */
    .fw-zone {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      padding: 0.75rem;
      border: 1px dashed #27272a;
      border-radius: 8px;
      transition: border-color 0.25s ease, background 0.25s ease;
    }

    .fw-zone--active {
      border-color: rgba(34, 197, 94, 0.35);
      background: rgba(34, 197, 94, 0.04);
    }

    /* ── Divider ── */
    .fw-divider {
      height: 1px;
      background: #1f1f22;
      margin: 0.875rem 0 0;
    }

    /* ── Footer ── */
    .fw-footer {
      display: flex;
      align-items: center;
      padding-top: 0.75rem;
    }

    .fw-status {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8125rem;
      color: #52525b;
      transition: color 0.25s ease;
    }

    .fw-status--active {
      color: #a1a1aa;
    }

    /* ── Status dot ── */
    .fw-dot {
      position: relative;
      width: 6px;
      height: 6px;
      flex-shrink: 0;
    }

    .fw-dot::before,
    .fw-dot::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: #3f3f46;
      transition: background 0.25s ease;
    }

    .fw-dot--active::before,
    .fw-dot--active::after {
      background: #22c55e;
    }

    .fw-dot--active::after {
      animation: fwPulse 2s ease-out infinite;
    }

    @keyframes fwPulse {
      0%   { transform: scale(1); opacity: 0.6; }
      100% { transform: scale(3); opacity: 0; }
    }
  `,
})
export class ElementFocusWithinDemo {
  readonly container = viewChild<HTMLElement>('container');
  readonly isFocusedWithin = elementFocusWithin(this.container);

  readonly importCode = `import { elementFocusWithin } from '@signality/core'`;
}

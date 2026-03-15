import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { elementHover } from '@signality/core/elements/element-hover';
import { DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-element-hover',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard],
  template: `
    <ng-demo-wrapper [demoPath]="'element-hover/element-hover-demo'" [code]="importCode">
      <demo-card>
        <!-- Hover zone -->
        <div #hoverEl class="eh-zone" [class.eh-zone--active]="isHovered()">
          @if (isHovered()) {
          <span class="eh-dot"></span>
          }
          {{ isHovered() ? 'Hovering…' : 'Hover over me' }}
        </div>
      </demo-card>
    </ng-demo-wrapper>
  `,
  styles: `
    /* ── Hover zone ── */
    .eh-zone {
      height: 80px;
      border: 1px dashed #27272a;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      font-size: 0.8125rem;
      color: #60606b;
      cursor: default;
      user-select: none;
      transition: border-color 0.25s ease, background 0.25s ease, color 0.25s ease;
    }

    .eh-zone--active {
      border-color: rgba(34, 197, 94, 0.35);
      background: rgba(34, 197, 94, 0.04);
      color: #22c55e;
    }

    /* ── Inline dot ── */
    .eh-dot {
      position: relative;
      display: inline-flex;
      width: 6px;
      height: 6px;
      flex-shrink: 0;
    }

    .eh-dot::before,
    .eh-dot::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: #22c55e;
    }

    .eh-dot::after {
      animation: ehPulse 2s ease-out infinite;
    }

    @keyframes ehPulse {
      0% {
        transform: scale(1);
        opacity: 0.6;
      }
      100% {
        transform: scale(3);
        opacity: 0;
      }
    }
  `,
})
export class ElementHoverDemo {
  readonly hoverEl = viewChild<HTMLElement>('hoverEl');
  readonly isHovered = elementHover(this.hoverEl);

  readonly importCode = `import { elementHover } from '@signality/core'`;
}

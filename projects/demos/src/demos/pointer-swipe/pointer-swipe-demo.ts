import { ChangeDetectionStrategy, Component, computed, viewChild } from '@angular/core';
import { pointerSwipe } from '@signality/core/elements/pointer-swipe';
import { DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-pointer-swipe',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard],
  template: `
    <ng-demo-wrapper [demoPath]="'pointer-swipe/pointer-swipe-demo'" [code]="importCode">
      <demo-card>
        <!-- Swipe zone -->
        <div
          #swipeArea
          class="ps-zone"
          [class.ps-zone--active]="sw.isSwiping()"
          touch-action="none"
        >
          @if (sw.isSwiping() && sw.direction() !== 'none') {
          <svg
            class="ps-arrow"
            [style.transform]="'rotate(' + arrowRotation() + 'deg)'"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="12" y1="19" x2="12" y2="5" />
            <polyline points="5 12 12 5 19 12" />
          </svg>
          }
          {{ sw.isSwiping() ? directionLabel() : 'Swipe here' }}
        </div>

        <!-- Divider -->
        <div class="ps-divider"></div>

        <!-- Info rows -->
        <div class="ps-rows">
          <div class="ps-row">
            <span class="ps-label">Direction</span>
            <span class="ps-value">{{ directionLabel() }}</span>
          </div>
          <div class="ps-row">
            <span class="ps-label">Distance X</span>
            <span class="ps-value">{{ sw.distanceX() }}px</span>
          </div>
          <div class="ps-row">
            <span class="ps-label">Distance Y</span>
            <span class="ps-value">{{ sw.distanceY() }}px</span>
          </div>
        </div>

        <!-- Divider -->
        <div class="ps-divider"></div>

        <!-- Footer -->
        <div class="ps-footer">
          <span class="ps-status" [class.ps-status--active]="sw.isSwiping()">
            <span class="ps-dot" [class.ps-dot--active]="sw.isSwiping()"></span>
            {{ sw.isSwiping() ? 'Swiping…' : 'Idle' }}
          </span>
        </div>
      </demo-card>
    </ng-demo-wrapper>
  `,
  styles: `
    /* ── Swipe zone ── */
    .ps-zone {
      height: 96px;
      border: 1px dashed #27272a;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      font-size: 0.8125rem;
      color: #71717a;
      cursor: default;
      user-select: none;
      touch-action: none;
      transition: border-color 0.2s ease, background 0.2s ease, color 0.2s ease;
    }

    .ps-zone--active {
      border-color: rgba(222, 179, 235, 0.35);
      background: rgba(222, 179, 235, 0.04);
      color: #DEB3EB;
    }

    /* ── Arrow ── */
    .ps-arrow {
      flex-shrink: 0;
      transition: transform 0.15s ease;
    }

    /* ── Divider ── */
    .ps-divider {
      height: 1px;
      background: #1f1f22;
      margin: 0.875rem 0 0;
    }

    /* ── Info rows ── */
    .ps-rows {
      display: flex;
      flex-direction: column;
      padding-top: 0.75rem;
    }

    .ps-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.375rem 0;
    }

    .ps-row + .ps-row {
      border-top: 1px solid #1f1f22;
    }

    .ps-label {
      font-size: 0.8125rem;
      color: #71717a;
    }

    .ps-value {
      font-size: 0.8125rem;
      color: #a1a1aa;
    }

    /* ── Footer ── */
    .ps-footer {
      display: flex;
      align-items: center;
      padding-top: 0.75rem;
    }

    .ps-status {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8125rem;
      color: #52525b;
      transition: color 0.2s ease;
    }

    .ps-status--active {
      color: #a1a1aa;
    }

    /* ── Status dot ── */
    .ps-dot {
      position: relative;
      width: 6px;
      height: 6px;
      flex-shrink: 0;
    }

    .ps-dot::before,
    .ps-dot::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: #3f3f46;
      transition: background 0.2s ease;
    }

    .ps-dot--active::before,
    .ps-dot--active::after {
      background: #DEB3EB;
    }

    .ps-dot--active::after {
      animation: psPulse 2s ease-out infinite;
    }

    @keyframes psPulse {
      0%   { transform: scale(1); opacity: 0.6; }
      100% { transform: scale(3); opacity: 0; }
    }
  `,
})
export class PointerSwipeDemo {
  readonly swipeArea = viewChild<HTMLElement>('swipeArea');
  readonly sw = pointerSwipe(this.swipeArea);

  readonly importCode = `import { pointerSwipe } from '@signality/core'`;

  readonly arrowRotation = computed(() => {
    switch (this.sw.direction()) {
      case 'up':
        return 0;
      case 'down':
        return 180;
      case 'left':
        return -90;
      case 'right':
        return 90;
      default:
        return 0;
    }
  });

  readonly directionLabel = computed(() => {
    switch (this.sw.direction()) {
      case 'up':
        return '↑ Up';
      case 'down':
        return '↓ Down';
      case 'left':
        return '← Left';
      case 'right':
        return '→ Right';
      default:
        return '—';
    }
  });
}

import { ChangeDetectionStrategy, Component, computed, viewChild } from '@angular/core';
import { swipe, type SwipeDirection } from '@signality/core/elements/swipe';
import { DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-swipe',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard],
  template: `
    <ng-demo-wrapper [demoPath]="'swipe/swipe-demo'" [code]="importCode">
      <demo-card>
        <!-- Swipe zone -->
        <div #swipeArea class="sw-zone" [class.sw-zone--active]="sw.isSwiping()">
          <div class="sw-arrow" [class.sw-arrow--visible]="sw.direction() !== 'none'">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              [style.transform]="arrowRotation()"
            >
              <line x1="12" y1="19" x2="12" y2="5" />
              <polyline points="5 12 12 5 19 12" />
            </svg>
          </div>
          <span class="sw-hint" [class.sw-hint--hidden]="sw.isSwiping()"> Swipe here </span>
        </div>

        <!-- Divider -->
        <div class="sw-divider"></div>

        <!-- Info rows -->
        <div class="sw-rows">
          <div class="sw-row">
            <span class="sw-label">Direction</span>
            <span class="sw-value" [class.sw-value--active]="sw.direction() !== 'none'">
              {{ directionLabel() }}
            </span>
          </div>
          <div class="sw-row">
            <span class="sw-label">Distance X</span>
            <span class="sw-value sw-value--mono">{{ sw.distanceX() }}px</span>
          </div>
          <div class="sw-row">
            <span class="sw-label">Distance Y</span>
            <span class="sw-value sw-value--mono">{{ sw.distanceY() }}px</span>
          </div>
        </div>
      </demo-card>
    </ng-demo-wrapper>
  `,
  styles: `
    /* ── Swipe zone ── */
    .sw-zone {
      height: 96px;
      border: 1px dashed #27272a;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      touch-action: none;
      user-select: none;
      position: relative;
      transition: border-color 0.25s ease, background 0.25s ease;
    }

    .sw-zone--active {
      border-color: rgba(222, 179, 235, 0.35);
      background: rgba(222, 179, 235, 0.04);
    }

    /* ── Arrow ── */
    .sw-arrow {
      color: #DEB3EB;
      opacity: 0;
      transition: opacity 0.2s ease;
    }

    .sw-arrow--visible {
      opacity: 1;
    }

    .sw-arrow svg {
      transition: transform 0.2s ease;
      display: block;
    }

    /* ── Hint ── */
    .sw-hint {
      font-size: 0.8125rem;
      color: #52525b;
      transition: opacity 0.2s ease;
      position: absolute;
    }

    .sw-hint--hidden {
      opacity: 0;
    }

    /* ── Divider ── */
    .sw-divider {
      height: 1px;
      background: #1f1f22;
      margin: 0.875rem 0 0;
    }

    /* ── Info rows ── */
    .sw-rows {
      display: flex;
      flex-direction: column;
      padding-top: 0.75rem;
    }

    .sw-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.375rem 0;
    }

    .sw-row + .sw-row {
      border-top: 1px solid #1f1f22;
    }

    .sw-label {
      font-size: 0.8125rem;
      color: #71717a;
    }

    .sw-value {
      font-size: 0.8125rem;
      color: #52525b;
      transition: color 0.2s ease;
    }

    .sw-value--active {
      color: #a1a1aa;
    }

    .sw-value--mono {
      font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', monospace;
      font-size: 0.75rem;
      color: #71717a;
    }
  `,
})
export class SwipeDemo {
  readonly swipeArea = viewChild<HTMLElement>('swipeArea');
  readonly sw = swipe(this.swipeArea);

  readonly importCode = `import { swipe } from '@signality/core'`;

  readonly directionLabel = computed(() => {
    const map: Record<SwipeDirection, string> = {
      none: '—',
      left: '← Left',
      right: '→ Right',
      up: '↑ Up',
      down: '↓ Down',
    };
    return map[this.sw.direction()];
  });

  readonly arrowRotation = computed(() => {
    const map: Record<SwipeDirection, string> = {
      none: 'rotate(0deg)',
      up: 'rotate(0deg)',
      down: 'rotate(180deg)',
      left: 'rotate(-90deg)',
      right: 'rotate(90deg)',
    };
    return map[this.sw.direction()];
  });
}

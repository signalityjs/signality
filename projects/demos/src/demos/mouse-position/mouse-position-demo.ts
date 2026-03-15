import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { mousePosition } from '@signality/core';
import { DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-mouse-position',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard],
  template: `
    <ng-demo-wrapper [demoPath]="'mouse-position/mouse-position-demo'" [code]="importCode">
      <!-- Cursor follower (fixed, follows mouse globally) -->
      <div
        class="mp-follower"
        [class.mp-follower--visible]="isVisible()"
        [style.left.px]="position().x"
        [style.top.px]="position().y"
      ></div>

      <demo-card>
        <!-- Info rows -->
        <div class="mp-rows">
          <div class="mp-row">
            <span class="mp-label">X</span>
            <span class="mp-value">{{ position().x }}px</span>
          </div>
          <div class="mp-row">
            <span class="mp-label">Y</span>
            <span class="mp-value">{{ position().y }}px</span>
          </div>
        </div>

        <!-- Divider -->
        <div class="mp-divider"></div>

        <!-- Footer -->
        <div class="mp-footer">
          <span class="mp-status" [class.mp-status--active]="isVisible()">
            <span class="mp-dot" [class.mp-dot--active]="isVisible()"></span>
            {{ isVisible() ? 'Tracking' : 'Move your mouse' }}
          </span>
        </div>
      </demo-card>
    </ng-demo-wrapper>
  `,
  styles: `
    /* ── Cursor follower ── */
    .mp-follower {
      position: fixed;
      width: 10px;
      height: 10px;
      background: #DEB3EB;
      border-radius: 50%;
      pointer-events: none;
      transform: translate(-50%, -50%);
      opacity: 0;
      transition: opacity 0.2s ease;
      box-shadow: 0 0 10px #DEB3EB, 0 0 20px rgba(222, 179, 235, 0.5);
      z-index: 10;
    }

    .mp-follower--visible {
      opacity: 1;
    }

    /* ── Info rows ── */
    .mp-rows {
      display: flex;
      flex-direction: column;
    }

    .mp-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.375rem 0;
    }

    .mp-row + .mp-row {
      border-top: 1px solid #1f1f22;
    }

    .mp-label {
      font-size: 0.8125rem;
      color: #71717a;
    }

    .mp-value {
      font-size: 0.8125rem;
      color: #a1a1aa;
      font-variant-numeric: tabular-nums;
    }

    /* ── Divider ── */
    .mp-divider {
      height: 1px;
      background: #1f1f22;
      margin: 0.875rem 0 0;
    }

    /* ── Footer ── */
    .mp-footer {
      display: flex;
      align-items: center;
      padding-top: 0.75rem;
    }

    .mp-status {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8125rem;
      color: #52525b;
      transition: color 0.25s ease;
    }

    .mp-status--active {
      color: #a1a1aa;
    }

    /* ── Status dot ── */
    .mp-dot {
      position: relative;
      width: 6px;
      height: 6px;
      flex-shrink: 0;
    }

    .mp-dot::before,
    .mp-dot::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: #3f3f46;
      transition: background 0.25s ease;
    }

    .mp-dot--active::before,
    .mp-dot--active::after {
      background: #DEB3EB;
    }

    .mp-dot--active::after {
      animation: mpPulse 2s ease-out infinite;
    }

    @keyframes mpPulse {
      0%   { transform: scale(1); opacity: 0.6; }
      100% { transform: scale(3); opacity: 0; }
    }
  `,
})
export class MousePositionDemo {
  readonly position = mousePosition({ type: 'client' });

  readonly isVisible = computed(() => this.position().x !== 0 && this.position().y !== 0);

  readonly importCode = `import { mousePosition } from '@signality/core'`;
}

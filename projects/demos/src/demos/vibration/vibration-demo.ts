import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { vibration } from '@signality/core/browser/vibration';
import { DemoCard, DemoNotSupported, Wrapper } from '../../common';

@Component({
  selector: 'demo-vibration',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard, DemoNotSupported],
  template: `
    <ng-demo-wrapper [demoPath]="'vibration/vibration-demo'" [code]="importCode">
      @if (!vib.isSupported()) {
      <demo-not-supported
        title="Vibration Not Available"
        description="Vibration API is only available on mobile devices."
        [hints]="['Android Chrome', 'Firefox Android', 'Samsung Browser']"
      >
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <rect x="8" y="2" width="8" height="20" rx="2" />
          <path d="M4 9a8 8 0 0 0 0 6" opacity="0.5" />
          <path d="M20 9a8 8 0 0 1 0 6" opacity="0.5" />
        </svg>
      </demo-not-supported>
      } @else {
      <demo-card>
        <!-- Icon ring (120px container prevents shake from causing layout jumps) -->
        <div class="vb-visual">
          <div class="vb-ring-container">
            <div class="vb-ring" [class.vb-ring--active]="vib.isVibrating()">
              <div class="vb-icon-inner">
                <!-- Phone idle -->
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.75"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  [style.opacity]="idleOpacity()"
                >
                  <rect x="8" y="2" width="8" height="20" rx="2" />
                </svg>
                <!-- Phone vibrating (with waves) -->
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.75"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  [style.opacity]="activeOpacity()"
                >
                  <rect x="8" y="2" width="8" height="20" rx="2" />
                  <path d="M4 9a8 8 0 0 0 0 6" />
                  <path d="M20 9a8 8 0 0 1 0 6" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Divider + footer -->
        <div class="vb-divider"></div>
        <div class="vb-footer">
          <span class="vb-status" [class.vb-status--active]="vib.isVibrating()">
            <span class="vb-dot" [class.vb-dot--active]="vib.isVibrating()"></span>
            {{ vib.isVibrating() ? 'Vibrating…' : 'Idle' }}
          </span>
          <div class="vb-actions">
            <button class="vb-btn vb-btn--muted" (click)="vibratePattern()">Pattern</button>
            <button class="vb-btn vb-btn--accent" (click)="vibrate()">Vibrate</button>
          </div>
        </div>
      </demo-card>
      }
    </ng-demo-wrapper>
  `,
  styles: `
    /* ── Visual ── */
    .vb-visual {
      display: flex;
      justify-content: center;
      padding: 0.5rem 0 0.75rem;
    }

    .vb-ring-container {
      width: 120px;
      height: 120px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* ── Icon ring ── */
    .vb-ring {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      border: 1px solid rgba(161, 161, 170, 0.12);
      background: rgba(161, 161, 170, 0.04);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: border-color 0.3s ease, background 0.3s ease;
    }

    .vb-ring--active {
      border-color: rgba(245, 158, 11, 0.3);
      background: rgba(245, 158, 11, 0.08);
      animation: vbShake 0.08s ease-in-out infinite;
    }

    @keyframes vbShake {
      0%, 100% { transform: translateX(0); }
      25%       { transform: translateX(-2.5px); }
      75%       { transform: translateX(2.5px); }
    }

    /* ── Icons ── */
    .vb-icon-inner {
      position: relative;
      width: 26px;
      height: 26px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #71717a;
      transition: color 0.3s ease;
    }

    .vb-ring--active .vb-icon-inner {
      color: #f59e0b;
    }

    .vb-icon-inner svg {
      position: absolute;
      transition: opacity 0.25s ease;
    }

    /* ── Divider ── */
    .vb-divider {
      height: 1px;
      background: #1f1f22;
      margin: 0.875rem 0 0;
    }

    /* ── Footer ── */
    .vb-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 0.75rem;
    }

    .vb-status {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8125rem;
      color: #71717a;
      transition: color 0.3s ease;
    }

    .vb-status--active {
      color: #a1a1aa;
    }

    /* ── Status dot ── */
    .vb-dot {
      position: relative;
      width: 6px;
      height: 6px;
      flex-shrink: 0;
    }

    .vb-dot::before,
    .vb-dot::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: #3f3f46;
      transition: background 0.3s ease;
    }

    .vb-dot--active::before,
    .vb-dot--active::after {
      background: #f59e0b;
    }

    .vb-dot--active::after {
      animation: vbPulse 1.2s ease-out infinite;
    }

    @keyframes vbPulse {
      0%   { transform: scale(1); opacity: 0.6; }
      100% { transform: scale(3); opacity: 0; }
    }

    /* ── Action buttons ── */
    .vb-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .vb-btn {
      font-size: 0.8125rem;
      font-family: inherit;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
      transition: color 0.15s ease;
    }

    .vb-btn--muted {
      color: #52525b;
    }

    .vb-btn--muted:hover {
      color: #a1a1aa;
    }

    .vb-btn--accent {
      color: #DEB3EB;
    }

    .vb-btn--accent:hover {
      color: #e8c8f5;
    }
  `,
})
export class VibrationDemo {
  readonly vib = vibration();

  readonly importCode = `import { vibration } from '@signality/core'`;

  readonly idleOpacity = computed(() => (this.vib.isVibrating() ? 0 : 1));
  readonly activeOpacity = computed(() => (this.vib.isVibrating() ? 1 : 0));

  vibrate(): void {
    this.vib.vibrate(200);
  }

  vibratePattern(): void {
    this.vib.vibrate([100, 50, 100, 50, 200]);
  }
}

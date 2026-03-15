import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { pageVisibility } from '@signality/core/browser/page-visibility';
import { DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-page-visibility',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard],
  template: `
    <ng-demo-wrapper [demoPath]="'page-visibility/page-visibility-demo'" [code]="importCode">
      <demo-card>
        <div class="pv-wrap">
          <!-- Icon ring -->
          <div class="pv-visual">
            <div class="pv-icon-ring-container">
              <div class="pv-radar" [class.pv-radar--active]="isVisible()">
                <div class="pv-radar-ring pv-radar-ring--1"></div>
                <div class="pv-radar-ring pv-radar-ring--2"></div>
                <div class="pv-radar-ring pv-radar-ring--3"></div>
                <div
                  class="pv-icon-ring"
                  [class.pv-icon-ring--visible]="isVisible()"
                  [class.pv-icon-ring--hidden]="!isVisible()"
                >
                  <div class="pv-icon-inner">
                    <!-- Visible — open eye -->
                    <svg
                      width="26"
                      height="26"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      [style.opacity]="visibleOpacity()"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle class="pv-pupil" cx="12" cy="12" r="3" />
                    </svg>

                    <!-- Hidden — eye with slash -->
                    <svg
                      width="26"
                      height="26"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      [style.opacity]="hiddenOpacity()"
                    >
                      <path
                        d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"
                      />
                      <path
                        d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"
                      />
                      <path d="M14.12 14.12a3 3 0 0 1-4.24-4.24" />
                      <line x1="2" y1="2" x2="22" y2="22" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Text -->
          <div class="pv-text">
            <h3 class="pv-title">{{ isVisible() ? 'Visible' : 'Hidden' }}</h3>
            <p class="pv-subtitle">
              {{ isVisible() ? 'Page is in the foreground' : 'Switch back to see changes' }}
            </p>
          </div>
        </div>
      </demo-card>
    </ng-demo-wrapper>
  `,
  styles: `
    .pv-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding-top: 0.5rem;
      padding-bottom: 1.25rem;
    }

    /* ── Visual ── */
    .pv-visual {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 0.5rem;
    }

    .pv-icon-ring-container {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 120px;
      height: 120px;
    }

    /* ── Radar ── */
    .pv-radar {
      position: relative;
      width: 120px;
      height: 120px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .pv-radar-ring {
      position: absolute;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      border: 1px solid rgba(34, 197, 94, 0.25);
      opacity: 0;
      animation: pvRadar 3.4s cubic-bezier(0, 0, 0.5, 1) infinite;
      animation-play-state: paused;
    }

    .pv-radar--active .pv-radar-ring {
      animation-play-state: running;
    }

    .pv-radar-ring--1 { animation-delay: 0s; }
    .pv-radar-ring--2 { animation-delay: 1.067s; }
    .pv-radar-ring--3 { animation-delay: 2.133s; }

    @keyframes pvRadar {
      0%   { transform: scale(1); opacity: 0; }
      12%  { opacity: 0.4; border-color: rgba(34, 197, 94, 0.2); }
      100% { transform: scale(2.6); opacity: 0; border-color: rgba(34, 197, 94, 0); }
    }

    /* ── Icon ring ── */
    .pv-icon-ring {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      border: 1px solid rgba(222, 179, 235, 0.2);
      background: rgba(222, 179, 235, 0.05);
      display: flex;
      align-items: center;
      justify-content: center;
      transition:
        border-color 0.4s ease,
        background 0.4s ease;
    }

    .pv-icon-ring--visible {
      border-color: rgba(34, 197, 94, 0.3);
      background: rgba(34, 197, 94, 0.08);
    }

    .pv-icon-ring--hidden {
      border-color: rgba(113, 113, 122, 0.2);
      background: rgba(113, 113, 122, 0.05);
    }

    /* ── Icons inside ring ── */
    .pv-icon-inner {
      position: relative;
      width: 26px;
      height: 26px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #DEB3EB;
    }

    .pv-icon-ring--visible .pv-icon-inner { color: #22c55e; }
    .pv-icon-ring--hidden  .pv-icon-inner { color: #52525b; }

    .pv-icon-inner svg {
      position: absolute;
      transition: opacity 0.4s ease;
    }

    /* ── Pupil blink animation ── */
    @keyframes pvBlink {
      0%, 90%, 100% { transform: scaleY(1); }
      95%           { transform: scaleY(0.1); }
    }

    .pv-pupil {
      transform-origin: 12px 12px;
      animation: pvBlink 4s ease-in-out infinite;
      animation-play-state: paused;
    }

    .pv-icon-ring--visible .pv-pupil {
      animation-play-state: running;
    }

    /* ── Typography ── */
    .pv-text {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .pv-title {
      font-size: 1.125rem;
      font-weight: 600;
      margin: 0 0 0.375rem 0;
      text-align: center;
      letter-spacing: -0.01em;
      color: #eee;
    }

    .pv-subtitle {
      font-size: 0.8125rem;
      font-weight: 400;
      color: #71717a;
      margin: 0;
      text-align: center;
      line-height: 1.5;
    }
  `,
})
export class PageVisibilityDemo {
  readonly visibility = pageVisibility();

  readonly importCode = `import { pageVisibility } from '@signality/core'`;

  readonly isVisible = computed(() => this.visibility() === 'visible');

  readonly visibleOpacity = computed(() => (this.isVisible() ? 1 : 0));
  readonly hiddenOpacity = computed(() => (this.isVisible() ? 0 : 1));
}

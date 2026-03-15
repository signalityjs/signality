import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { online } from '@signality/core/browser/online';
import { DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-online',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard],
  template: `
    <ng-demo-wrapper [demoPath]="'online/online-demo'" [code]="importCode">
      <demo-card>
        <div class="on-wrap">
          <!-- Icon ring -->
          <div class="on-visual">
            <div class="on-icon-ring-container">
              <div class="on-radar" [class.on-radar--active]="isOnline()">
                <div class="on-radar-ring on-radar-ring--1"></div>
                <div class="on-radar-ring on-radar-ring--2"></div>
                <div class="on-radar-ring on-radar-ring--3"></div>
                <div
                  class="on-icon-ring"
                  [class.on-icon-ring--online]="isOnline()"
                  [class.on-icon-ring--offline]="!isOnline()"
                >
                  <div class="on-icon-inner">
                    <!-- Online — WiFi signal -->
                    <svg
                      width="26"
                      height="26"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      [style.opacity]="onlineOpacity()"
                    >
                      <path class="on-arc on-arc--3" d="M1.42 9a16 16 0 0 1 21.16 0" />
                      <path class="on-arc on-arc--2" d="M5 12.55a11 11 0 0 1 14.08 0" />
                      <path class="on-arc on-arc--1" d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                      <circle
                        class="on-dot"
                        cx="12"
                        cy="20"
                        r="1"
                        fill="currentColor"
                        stroke="none"
                      />
                    </svg>

                    <!-- Offline — WiFi with slash -->
                    <svg
                      width="26"
                      height="26"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      [style.opacity]="offlineOpacity()"
                    >
                      <line x1="2" y1="2" x2="22" y2="22" />
                      <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
                      <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
                      <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
                      <path d="M1.42 9a15.9 15.9 0 0 1 4.7-2.88" />
                      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                      <circle cx="12" cy="20" r="1" fill="currentColor" stroke="none" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Text -->
          <div class="on-text">
            <h3 class="on-title">{{ isOnline() ? 'Online' : 'Offline' }}</h3>
            <p class="on-subtitle">
              {{ isOnline() ? 'Connected to the network' : 'No network connection' }}
            </p>
          </div>
        </div>
      </demo-card>
    </ng-demo-wrapper>
  `,
  styles: `
    .on-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding-top: 0.5rem;
      padding-bottom: 1.25rem;
    }

    /* ── Visual ── */
    .on-visual {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 0.5rem;
    }

    .on-icon-ring-container {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 120px;
      height: 120px;
    }

    /* ── Radar ── */
    .on-radar {
      position: relative;
      width: 120px;
      height: 120px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .on-radar-ring {
      position: absolute;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      border: 1px solid rgba(34, 197, 94, 0.25);
      opacity: 0;
      animation: onlineRadar 3.4s cubic-bezier(0, 0, 0.5, 1) infinite;
      animation-play-state: paused;
    }

    .on-radar--active .on-radar-ring {
      animation-play-state: running;
    }

    .on-radar-ring--1 { animation-delay: 0s; }
    .on-radar-ring--2 { animation-delay: 1.067s; }
    .on-radar-ring--3 { animation-delay: 2.133s; }

    @keyframes onlineRadar {
      0%   { transform: scale(1); opacity: 0; }
      12%  { opacity: 0.4; border-color: rgba(34, 197, 94, 0.2); }
      100% { transform: scale(2.6); opacity: 0; border-color: rgba(34, 197, 94, 0); }
    }

    /* ── Icon ring ── */
    .on-icon-ring {
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

    .on-icon-ring--online {
      border-color: rgba(34, 197, 94, 0.3);
      background: rgba(34, 197, 94, 0.08);
    }

    .on-icon-ring--offline {
      border-color: rgba(239, 68, 68, 0.3);
      background: rgba(239, 68, 68, 0.08);
    }

    /* ── Icons inside ring ── */
    .on-icon-inner {
      position: relative;
      width: 26px;
      height: 26px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #DEB3EB;
    }

    .on-icon-ring--online  .on-icon-inner { color: #22c55e; }
    .on-icon-ring--offline .on-icon-inner { color: #ef4444; }

    .on-icon-inner svg {
      position: absolute;
      transition: opacity 0.4s ease;
    }

    /* ── WiFi ripple animation ── */
    @keyframes wifiRipple {
      0%, 100% { opacity: 0.2; }
      40%      { opacity: 1; }
    }

    @keyframes dotPulse {
      0%, 100% { transform: scale(1);   opacity: 0.6; }
      40%      { transform: scale(1.4); opacity: 1; }
    }

    .on-arc {
      animation: wifiRipple 2.4s ease-in-out infinite;
      animation-play-state: paused;
    }

    .on-dot {
      animation: dotPulse 2.4s ease-in-out infinite;
      animation-play-state: paused;
      transform-origin: 12px 20px;
    }

    .on-icon-ring--online .on-arc,
    .on-icon-ring--online .on-dot {
      animation-play-state: running;
    }

    .on-arc--1 { animation-delay: 0s; }
    .on-arc--2 { animation-delay: 0.22s; }
    .on-arc--3 { animation-delay: 0.44s; }
    .on-dot    { animation-delay: 0s; }

    /* ── Typography ── */
    .on-text {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .on-title {
      font-size: 1.125rem;
      font-weight: 600;
      margin: 0 0 0.375rem 0;
      text-align: center;
      letter-spacing: -0.01em;
      color: #eee;
    }

    .on-subtitle {
      font-size: 0.8125rem;
      font-weight: 400;
      color: #71717a;
      margin: 0;
      text-align: center;
      line-height: 1.5;
    }
  `,
})
export class OnlineDemo {
  readonly isOnline = online();

  readonly importCode = `import { online } from '@signality/core'`;

  readonly onlineOpacity = computed(() => (this.isOnline() ? 1 : 0));
  readonly offlineOpacity = computed(() => (this.isOnline() ? 0 : 1));
}

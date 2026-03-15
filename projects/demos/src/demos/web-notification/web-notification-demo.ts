import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { webNotification } from '@signality/core/browser/web-notification';
import { DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-web-notification',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard],
  template: `
    <ng-demo-wrapper [demoPath]="'web-notification/web-notification-demo'" [code]="importCode">
      <demo-card>
        <!-- Icon ring -->
        <div class="wn-visual">
          <div
            class="wn-icon-ring"
            [class.wn-icon-ring--granted]="state() === 'granted'"
            [class.wn-icon-ring--denied]="state() === 'denied'"
          >
            <div class="wn-icon-inner">
              <!-- Bell — default / granted idle -->
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.75"
                stroke-linecap="round"
                stroke-linejoin="round"
                [style.opacity]="bellOpacity()"
              >
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
              </svg>
              <!-- Checkmark — sent -->
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                [style.opacity]="checkOpacity()"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <!-- X — denied -->
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                [style.opacity]="deniedOpacity()"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Title + subtitle -->
        <div class="wn-text">
          <h3 class="wn-title">{{ title() }}</h3>
          <p class="wn-subtitle">{{ subtitle() }}</p>
        </div>

        <!-- Divider -->
        <div class="wn-divider"></div>

        <!-- Footer -->
        <div class="wn-footer">
          <span
            class="wn-status"
            [class.wn-status--granted]="state() === 'granted'"
            [class.wn-status--denied]="state() === 'denied'"
          >
            <span
              class="wn-dot"
              [class.wn-dot--granted]="state() === 'granted'"
              [class.wn-dot--denied]="state() === 'denied'"
            ></span>
            {{ statusLabel() }}
          </span>

          @if (state() === 'default') {
          <button class="wn-btn" (click)="requestPermission()">Allow</button>
          } @else if (state() === 'granted') {
          <button class="wn-btn" (click)="send()">Send</button>
          }
        </div>
      </demo-card>
    </ng-demo-wrapper>
  `,
  styles: `
    /* ── Icon ring ── */
    .wn-visual {
      display: flex;
      justify-content: center;
      padding: 0.5rem 0 0.75rem;
    }

    .wn-icon-ring {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      border: 1px solid rgba(161, 161, 170, 0.12);
      background: rgba(161, 161, 170, 0.04);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: border-color 0.4s ease, background 0.4s ease;
    }

    .wn-icon-ring--granted {
      border-color: rgba(34, 197, 94, 0.3);
      background: rgba(34, 197, 94, 0.06);
    }

    .wn-icon-ring--denied {
      border-color: rgba(239, 68, 68, 0.3);
      background: rgba(239, 68, 68, 0.06);
    }

    .wn-icon-inner {
      position: relative;
      width: 26px;
      height: 26px;
      color: #71717a;
      transition: color 0.4s ease;
    }

    .wn-icon-ring--granted .wn-icon-inner { color: #22c55e; }
    .wn-icon-ring--denied .wn-icon-inner  { color: #ef4444; }

    .wn-icon-inner svg {
      position: absolute;
      inset: 0;
      transition: opacity 0.35s ease;
    }

    /* ── Text ── */
    .wn-text {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
      padding-bottom: 0.75rem;
    }

    .wn-title {
      font-size: 1.0625rem;
      font-weight: 600;
      color: #a1a1aa;
      margin: 0;
      letter-spacing: -0.01em;
      text-align: center;
    }

    .wn-subtitle {
      font-size: 0.8125rem;
      color: #52525b;
      margin: 0;
      text-align: center;
      line-height: 1.5;
      max-width: 240px;
      min-height: 1.25rem;
    }

    /* ── Divider ── */
    .wn-divider {
      height: 1px;
      background: #1f1f22;
      margin: 0;
    }

    /* ── Footer ── */
    .wn-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 0.75rem;
    }

    .wn-status {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8125rem;
      color: #52525b;
      transition: color 0.25s ease;
    }

    .wn-status--granted { color: #a1a1aa; }
    .wn-status--denied  { color: #a1a1aa; }

    /* ── Status dot ── */
    .wn-dot {
      position: relative;
      width: 6px;
      height: 6px;
      flex-shrink: 0;
    }

    .wn-dot::before,
    .wn-dot::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: #3f3f46;
      transition: background 0.25s ease;
    }

    .wn-dot--granted::before,
    .wn-dot--granted::after { background: #22c55e; }

    .wn-dot--granted::after {
      animation: wnPulse 2s ease-out infinite;
    }

    .wn-dot--denied::before,
    .wn-dot--denied::after { background: #ef4444; }

    @keyframes wnPulse {
      0%   { transform: scale(1); opacity: 0.6; }
      100% { transform: scale(3); opacity: 0; }
    }

    /* ── Ghost button ── */
    .wn-btn {
      font-size: 0.8125rem;
      font-family: inherit;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
      color: #DEB3EB;
      transition: color 0.15s ease;
    }

    .wn-btn:hover { color: #e8c8f5; }
  `,
})
export class WebNotificationDemo {
  readonly notif = webNotification();

  readonly importCode = `import { webNotification } from '@signality/core'`;

  readonly state = computed<'unsupported' | 'default' | 'granted' | 'denied'>(() => {
    if (!this.notif.isSupported()) return 'unsupported';
    return this.notif.permission();
  });

  readonly title = computed(() => {
    switch (this.state()) {
      case 'unsupported':
        return 'Not Supported';
      case 'default':
        return 'Notifications';
      case 'denied':
        return 'Permission Denied';
      case 'granted':
        return this.notif.notification() ? 'Sent!' : 'Ready';
    }
  });

  readonly subtitle = computed(() => {
    switch (this.state()) {
      case 'unsupported':
        return 'Notifications API not available';
      case 'default':
        return 'Allow to receive browser notifications';
      case 'denied':
        return 'Enable in browser settings to continue';
      case 'granted':
        return this.notif.notification() ? 'Notification delivered' : 'Notifications are enabled';
    }
  });

  readonly statusLabel = computed(() => {
    switch (this.state()) {
      case 'unsupported':
        return 'Not supported';
      case 'default':
        return 'Waiting for permission';
      case 'denied':
        return 'Permission denied';
      case 'granted':
        return this.notif.notification() ? 'Sent' : 'Granted';
    }
  });

  readonly bellOpacity = computed(() =>
    this.state() === 'default' || (this.state() === 'granted' && !this.notif.notification()) ? 1 : 0
  );
  readonly checkOpacity = computed(() => (this.notif.notification() ? 1 : 0));
  readonly deniedOpacity = computed(() => (this.state() === 'denied' ? 1 : 0));

  async requestPermission(): Promise<void> {
    await this.notif.requestPermission();
  }

  send(): void {
    this.notif.show('Hello from Signality!', {
      body: 'Web Notifications API wrapped with Angular signals.',
    });
  }
}

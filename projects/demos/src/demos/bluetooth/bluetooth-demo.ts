import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { bluetooth } from '@signality/core/browser/bluetooth';
import { DemoCard, DemoNotSupported, Wrapper } from '../../common';

@Component({
  selector: 'demo-bluetooth',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard, DemoNotSupported],
  template: `
    <ng-demo-wrapper [demoPath]="'bluetooth/bluetooth-demo'" [code]="importCode">
      @if (state() === 'unsupported') {
      <demo-not-supported
        title="Bluetooth Not Available"
        description="Web Bluetooth API requires a Chromium-based browser on a secure origin."
        [hints]="['Chrome 56+', 'Edge 79+', 'Opera 43+']"
      >
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M6.5 6.5l11 11L12 23V1l5.5 5.5-11 11" />
          <line x1="3" y1="3" x2="21" y2="21" stroke-width="2" opacity="0.7" />
        </svg>
      </demo-not-supported>
      } @else {
      <demo-card>
        <!-- Radar + icon ring -->
        <div class="bt-visual">
          <div class="bt-radar" [class.bt-radar--active]="state() === 'connecting'">
            <div class="bt-radar-ring bt-radar-ring--1"></div>
            <div class="bt-radar-ring bt-radar-ring--2"></div>
            <div class="bt-radar-ring bt-radar-ring--3"></div>
            <div
              class="bt-icon-ring"
              [class.bt-icon-ring--success]="state() === 'connected'"
              [class.bt-icon-ring--error]="state() === 'error'"
            >
              <div class="bt-icon-inner" [class.bt-icon-inner--pulse]="state() === 'connecting'">
                <!-- Bluetooth icon -->
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  [style.opacity]="iconOpacity()"
                >
                  <path d="M6.5 6.5l11 11L12 23V1l5.5 5.5-11 11" />
                </svg>
                <!-- Checkmark -->
                <svg
                  width="28"
                  height="28"
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
                <!-- X -->
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  [style.opacity]="errorOpacity()"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Title + subtitle -->
        <div class="bt-text">
          <h3 class="bt-title" [class.bt-title--shimmer]="state() === 'connecting'">
            {{ title() }}
          </h3>
          @if (subtitle()) {
          <p class="bt-subtitle">{{ subtitle() }}</p>
          }
        </div>

        <!-- Error area — max-height reveal -->
        <div class="bt-error-area" [class.bt-error-area--visible]="state() === 'error'">
          <p class="bt-error-message">{{ errorMessage() }}</p>
        </div>

        <!-- Divider -->
        <div class="bt-divider"></div>

        <!-- Footer -->
        <div class="bt-footer">
          <span
            class="bt-status"
            [class.bt-status--connected]="state() === 'connected'"
            [class.bt-status--connecting]="state() === 'connecting'"
            [class.bt-status--error]="state() === 'error'"
          >
            <span
              class="bt-dot"
              [class.bt-dot--connected]="state() === 'connected'"
              [class.bt-dot--connecting]="state() === 'connecting'"
              [class.bt-dot--error]="state() === 'error'"
            ></span>
            {{ statusLabel() }}
          </span>

          @if (state() === 'connected') {
          <button class="bt-btn" (click)="disconnect()">Disconnect</button>
          } @else {
          <button class="bt-btn" [disabled]="state() === 'connecting'" (click)="connect()">
            {{ state() === 'connecting' ? 'Searching…' : 'Connect' }}
          </button>
          }
        </div>
      </demo-card>
      }
    </ng-demo-wrapper>
  `,
  styles: `
    /* ── Visual anchor ── */
    .bt-visual {
      display: flex;
      justify-content: center;
      padding: 0.5rem 0 0.625rem;
    }

    /* ── Radar ── */
    .bt-radar {
      position: relative;
      width: 120px;
      height: 120px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .bt-radar-ring {
      position: absolute;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      border: 1px solid rgba(222, 179, 235, 0.25);
      opacity: 0;
      animation: radarPulse 3.4s cubic-bezier(0, 0, 0.5, 1) infinite;
      animation-play-state: paused;
    }

    .bt-radar--active .bt-radar-ring {
      animation-play-state: running;
    }

    .bt-radar-ring--1 { animation-delay: 0s; }
    .bt-radar-ring--2 { animation-delay: 1.067s; }
    .bt-radar-ring--3 { animation-delay: 2.133s; }

    @keyframes radarPulse {
      0%   { transform: scale(1); opacity: 0; }
      12%  { opacity: 0.45; border-color: rgba(222, 179, 235, 0.2); }
      100% { transform: scale(2.6); opacity: 0; border-color: rgba(222, 179, 235, 0); }
    }

    /* ── Icon ring ── */
    .bt-icon-ring {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      border: 1px solid rgba(222, 179, 235, 0.2);
      background: rgba(222, 179, 235, 0.05);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: border-color 0.4s ease, background 0.4s ease;
    }

    .bt-icon-ring--success {
      border-color: rgba(34, 197, 94, 0.3);
      background: rgba(34, 197, 94, 0.08);
    }

    .bt-icon-ring--error {
      border-color: rgba(239, 68, 68, 0.3);
      background: rgba(239, 68, 68, 0.08);
    }

    /* ── Icons inside ring ── */
    .bt-icon-inner {
      position: relative;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #DEB3EB;
    }

    .bt-icon-ring--success .bt-icon-inner { color: #22c55e; }
    .bt-icon-ring--error .bt-icon-inner   { color: #ef4444; }

    .bt-icon-inner svg {
      position: absolute;
      transition: opacity 0.4s ease;
    }

    .bt-icon-inner--pulse {
      animation: iconPulse 2s ease-in-out infinite;
    }

    @keyframes iconPulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50%      { opacity: 0.7; transform: scale(0.95); }
    }

    /* ── Text ── */
    .bt-text {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
      padding-bottom: 0.625rem;
    }

    .bt-title {
      font-size: 1.0625rem;
      font-weight: 600;
      color: #a1a1aa;
      margin: 0;
      letter-spacing: -0.01em;
      text-align: center;
    }

    .bt-title--shimmer {
      background: linear-gradient(to right, #888895 0%, #ffffff 50%, #888895 100%);
      background-size: 200% auto;
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: shimmer 4s linear infinite;
    }

    @keyframes shimmer {
      0%   { background-position: 200% center; }
      100% { background-position: -200% center; }
    }

    .bt-subtitle {
      font-size: 0.8125rem;
      color: #52525b;
      margin: 0;
      text-align: center;
      line-height: 1.5;
      max-width: 260px;
    }

    /* ── Error area ── */
    .bt-error-area {
      max-height: 0;
      overflow: hidden;
      opacity: 0;
      transition: max-height 0.4s ease, opacity 0.3s ease, margin 0.4s ease;
    }

    .bt-error-area--visible {
      max-height: 40px;
      opacity: 1;
      margin-bottom: 0.5rem;
    }

    .bt-error-message {
      font-size: 0.8125rem;
      color: #ef4444;
      margin: 0;
      text-align: center;
    }

    /* ── Divider ── */
    .bt-divider {
      height: 1px;
      background: #1f1f22;
      margin: 0;
    }

    /* ── Footer ── */
    .bt-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 0.75rem;
    }

    .bt-status {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8125rem;
      color: #52525b;
      transition: color 0.25s ease;
    }

    .bt-status--connecting { color: #a1a1aa; }
    .bt-status--connected  { color: #a1a1aa; }
    .bt-status--error      { color: #a1a1aa; }

    /* ── Status dot ── */
    .bt-dot {
      position: relative;
      width: 6px;
      height: 6px;
      flex-shrink: 0;
    }

    .bt-dot::before,
    .bt-dot::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: #3f3f46;
      transition: background 0.25s ease;
    }

    .bt-dot--connecting::before,
    .bt-dot--connecting::after { background: #DEB3EB; }

    .bt-dot--connecting::after {
      animation: btPulse 1.4s ease-out infinite;
    }

    .bt-dot--connected::before,
    .bt-dot--connected::after { background: #22c55e; }

    .bt-dot--connected::after {
      animation: btPulse 2s ease-out infinite;
    }

    .bt-dot--error::before,
    .bt-dot--error::after { background: #ef4444; }

    @keyframes btPulse {
      0%   { transform: scale(1); opacity: 0.6; }
      100% { transform: scale(3); opacity: 0; }
    }

    /* ── Ghost button ── */
    .bt-btn {
      font-size: 0.8125rem;
      font-family: inherit;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
      color: #DEB3EB;
      transition: color 0.15s ease;
    }

    .bt-btn:hover:not(:disabled) { color: #e8c8f5; }

    .bt-btn:disabled {
      color: #52525b;
      cursor: default;
    }
  `,
})
export class BluetoothDemo {
  readonly bt = bluetooth();

  readonly importCode = `import { bluetooth } from '@signality/core'`;

  readonly state = computed<'unsupported' | 'idle' | 'connecting' | 'connected' | 'error'>(() => {
    if (!this.bt.isSupported()) return 'unsupported';
    if (this.bt.error()) return 'error';
    if (this.bt.isConnected()) return 'connected';
    if (this.bt.isConnecting()) return 'connecting';
    return 'idle';
  });

  readonly title = computed(() => {
    switch (this.state()) {
      case 'connecting':
        return 'Searching...';
      case 'connected':
        return 'Connected';
      case 'error':
        return 'Connection Failed';
      default:
        return 'Bluetooth';
    }
  });

  readonly subtitle = computed(() => {
    switch (this.state()) {
      case 'connecting':
        return 'Looking for nearby Bluetooth devices';
      case 'connected':
        return this.bt.device()?.name || 'Unknown Device';
      case 'error':
        return '';
      default:
        return 'Discover and connect to nearby devices';
    }
  });

  readonly statusLabel = computed(() => {
    switch (this.state()) {
      case 'connecting':
        return 'Searching…';
      case 'connected':
        return 'Connected';
      case 'error':
        return 'Failed';
      default:
        return 'Idle';
    }
  });

  readonly errorMessage = computed(() => {
    const err = this.bt.error();
    if (!err) return '';
    if (err.message.includes('User cancelled')) return 'Connection cancelled by user';
    if (err.message.includes('not found')) return 'No device found in range';
    return err.message;
  });

  readonly iconOpacity = computed(() => (['idle', 'connecting'].includes(this.state()) ? 1 : 0));
  readonly checkOpacity = computed(() => (this.state() === 'connected' ? 1 : 0));
  readonly errorOpacity = computed(() => (this.state() === 'error' ? 1 : 0));

  async connect(): Promise<void> {
    await this.bt.request();
  }

  disconnect(): void {
    this.bt.disconnect();
  }
}

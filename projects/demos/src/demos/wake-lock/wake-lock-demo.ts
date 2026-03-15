import { ChangeDetectionStrategy, Component } from '@angular/core';
import { wakeLock } from '@signality/core/browser/wake-lock';
import { DemoCard, DemoNotSupported, Wrapper } from '../../common';

@Component({
  selector: 'demo-wake-lock',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard, DemoNotSupported],
  template: `
    <ng-demo-wrapper [demoPath]="'wake-lock/wake-lock-demo'" [code]="importCode">
      @if (!wl.isSupported()) {
      <demo-not-supported
        title="Not Available"
        description="Screen Wake Lock API requires a secure context (HTTPS) and a supported browser."
        [hints]="['Chrome 84+', 'Edge 84+', 'HTTPS']"
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
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </demo-not-supported>
      } @else {
      <demo-card>
        <!-- Visual indicator -->
        <div class="wl-visual">
          <div class="wl-ring" [class.wl-ring--active]="wl.isActive()">
            <div class="wl-halo" [class.wl-halo--active]="wl.isActive()"></div>
            <div class="wl-icons">
              <!-- Moon: visible when inactive -->
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                [style.opacity]="wl.isActive() ? 0 : 1"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
              <!-- Sun: visible when active -->
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                [style.opacity]="wl.isActive() ? 1 : 0"
              >
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Divider + footer -->
        <div class="wl-divider"></div>
        <div class="wl-footer">
          <span class="wl-status" [class.wl-status--active]="wl.isActive()">
            <span class="wl-dot" [class.wl-dot--active]="wl.isActive()"></span>
            {{ wl.isActive() ? 'Screen awake' : 'Screen can sleep' }}
          </span>
          <button class="wl-btn" (click)="toggle()">
            {{ wl.isActive() ? 'Release' : 'Activate' }}
          </button>
        </div>
      </demo-card>
      }
    </ng-demo-wrapper>
  `,
  styles: `
    /* ── Visual ── */
    .wl-visual {
      display: flex;
      justify-content: center;
      padding: 0.75rem 0 1rem;
    }

    .wl-ring {
      position: relative;
      width: 80px;
      height: 80px;
      border-radius: 50%;
      border: 1px solid rgba(161, 161, 170, 0.12);
      background: rgba(161, 161, 170, 0.04);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #52525b;
      transition: border-color 0.4s ease, color 0.4s ease, background 0.4s ease;
    }

    .wl-ring--active {
      border-color: rgba(222, 179, 235, 0.3);
      background: rgba(222, 179, 235, 0.06);
      color: #DEB3EB;
    }

    /* Animated halo */
    .wl-halo {
      position: absolute;
      inset: -8px;
      border-radius: 50%;
      border: 1px solid rgba(222, 179, 235, 0);
      transition: border-color 0.4s ease;
    }

    .wl-halo--active {
      border-color: rgba(222, 179, 235, 0.12);
      animation: wlHalo 2.4s ease-out infinite;
    }

    @keyframes wlHalo {
      0%   { transform: scale(1); opacity: 1; }
      100% { transform: scale(1.5); opacity: 0; }
    }

    /* Icons overlay */
    .wl-icons {
      position: relative;
      width: 26px;
      height: 26px;
    }

    .wl-icons svg {
      position: absolute;
      inset: 0;
      transition: opacity 0.4s ease;
    }

    /* ── Divider ── */
    .wl-divider {
      height: 1px;
      background: #1f1f22;
      margin: 0.875rem 0 0;
    }

    /* ── Footer ── */
    .wl-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 0.75rem;
    }

    .wl-status {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8125rem;
      color: #71717a;
      transition: color 0.3s ease;
    }

    .wl-status--active {
      color: #a1a1aa;
    }

    .wl-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #3f3f46;
      flex-shrink: 0;
      transition: background 0.3s ease, box-shadow 0.3s ease;
    }

    .wl-dot--active {
      background: #DEB3EB;
      box-shadow: 0 0 6px rgba(222, 179, 235, 0.5);
    }

    .wl-btn {
      font-size: 0.8125rem;
      font-family: inherit;
      color: #DEB3EB;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
      transition: color 0.15s ease;
    }

    .wl-btn:hover {
      color: #e8c8f5;
    }
  `,
})
export class WakeLockDemo {
  readonly wl = wakeLock();

  readonly importCode = `import { wakeLock } from '@signality/core'`;

  toggle(): void {
    if (this.wl.isActive()) {
      this.wl.release();
    } else {
      this.wl.request();
    }
  }
}

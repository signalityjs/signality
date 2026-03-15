import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { eyeDropper } from '@signality/core/browser/eye-dropper';
import { DemoCard, DemoNotSupported, Wrapper } from '../../common';

@Component({
  selector: 'demo-eye-dropper',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard, DemoNotSupported],
  template: `
    <ng-demo-wrapper [demoPath]="'eye-dropper/eye-dropper-demo'" [code]="importCode">
      @if (!ed.isSupported()) {
      <demo-not-supported
        title="EyeDropper Not Available"
        description="EyeDropper API is only available in Chromium-based browsers."
        [hints]="['Chrome 95+', 'Edge 95+', 'Opera 81+']"
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
          <path d="m2 22 1-1h3l9-9" />
          <path d="M3 21v-3l9-9" />
          <path
            d="m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l.4.4a2.1 2.1 0 1 1-3 3l-3.8-3.8a2.1 2.1 0 1 1 3-3l.4.4Z"
          />
        </svg>
      </demo-not-supported>
      } @else {
      <demo-card>
        <!-- Swatch -->
        <div class="ed-visual">
          <div class="ed-ring" [style.border-color]="ringBorder()">
            <div
              class="ed-swatch"
              [class.ed-swatch--picking]="isOpen()"
              [style.background]="hasColor() ? ed.sRGBHex() : null"
              [style.box-shadow]="glowStyle()"
            >
              <svg
                class="ed-icon"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                [style.opacity]="hasColor() ? 0 : 1"
              >
                <path d="m2 22 1-1h3l9-9" />
                <path d="M3 21v-3l9-9" />
                <path
                  d="m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l.4.4a2.1 2.1 0 1 1-3 3l-3.8-3.8a2.1 2.1 0 1 1 3-3l.4.4Z"
                />
              </svg>
            </div>
          </div>
        </div>

        <!-- Divider -->
        <div class="ed-divider"></div>

        <!-- Footer -->
        <div class="ed-footer">
          @if (hasColor()) {
          <span class="ed-hex" [style.color]="ed.sRGBHex()">{{ ed.sRGBHex() }}</span>
          } @else {
          <span class="ed-placeholder">
            {{ isOpen() ? 'Hover over any color…' : 'No color selected' }}
          </span>
          }
          <button class="ed-btn" [disabled]="isOpen()" (click)="pick()">
            {{ isOpen() ? 'Picking…' : hasColor() ? 'Pick again' : 'Pick Color' }}
          </button>
        </div>
      </demo-card>
      }
    </ng-demo-wrapper>
  `,
  styles: `
    /* ── Visual ── */
    .ed-visual {
      display: flex;
      justify-content: center;
      padding: 0.5rem 0 0.75rem;
    }

    /* ── Ring ── */
    .ed-ring {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      border: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 6px;
      box-sizing: border-box;
      transition: border-color 0.4s ease;
      flex-shrink: 0;
    }

    /* ── Swatch ── */
    .ed-swatch {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.04);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.35s ease, box-shadow 0.4s ease;
    }

    .ed-swatch--picking {
      animation: edPulse 1.6s ease-in-out infinite;
    }

    @keyframes edPulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50%       { opacity: 0.65; transform: scale(0.95); }
    }

    /* ── Icon ── */
    .ed-icon {
      color: #71717a;
      flex-shrink: 0;
      transition: opacity 0.3s ease;
    }

    /* ── Divider ── */
    .ed-divider {
      height: 1px;
      background: #1f1f22;
      margin: 0.875rem 0 0;
    }

    /* ── Footer ── */
    .ed-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 0.75rem;
    }

    .ed-hex {
      font-size: 0.8125rem;
      transition: color 0.35s ease;
    }

    .ed-placeholder {
      font-size: 0.8125rem;
      color: #71717a;
    }

    /* ── Button ── */
    .ed-btn {
      font-size: 0.8125rem;
      font-family: inherit;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
      color: #DEB3EB;
      transition: color 0.15s ease, opacity 0.15s ease;
    }

    .ed-btn:not(:disabled):hover {
      color: #e8c8f5;
    }

    .ed-btn:disabled {
      opacity: 0.45;
      cursor: default;
    }
  `,
})
export class EyeDropperDemo {
  readonly ed = eyeDropper();
  readonly isOpen = signal(false);

  readonly importCode = `import { eyeDropper } from '@signality/core'`;

  readonly hasColor = computed(() => !!this.ed.sRGBHex());

  readonly ringBorder = computed(() => {
    const hex = this.ed.sRGBHex();
    return hex ? hex + '55' : 'rgba(255, 255, 255, 0.08)';
  });

  readonly glowStyle = computed(() => {
    const hex = this.ed.sRGBHex();
    if (!hex) return null;
    return `0 0 18px ${hex}50, 0 0 6px ${hex}30`;
  });

  async pick(): Promise<void> {
    this.isOpen.set(true);
    await this.ed.open();
    this.isOpen.set(false);
  }
}

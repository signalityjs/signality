import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { devicePosture } from '@signality/core/browser/device-posture';
import { DemoCard, DemoNotSupported, Wrapper } from '../../common';

@Component({
  selector: 'demo-device-posture',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard, DemoNotSupported],
  template: `
    <ng-demo-wrapper [demoPath]="'device-posture/device-posture-demo'" [code]="importCode">
      @if (!posture.isSupported()) {
      <demo-not-supported
        title="Device Posture Not Available"
        description="Device Posture API is only available on foldable devices with Chromium."
        [hints]="['Chrome 125+', 'Edge 125+', 'Foldable device']"
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
          <rect x="5" y="2" width="14" height="20" rx="2" />
          <line x1="12" y1="2" x2="12" y2="22" stroke-dasharray="2 3" />
        </svg>
      </demo-not-supported>
      } @else {
      <demo-card>
        <div class="dp-wrap">
          <!-- Icon ring -->
          <div class="dp-visual">
            <div class="dp-icon-ring-container">
              <div
                class="dp-icon-ring"
                [class.dp-icon-ring--continuous]="posture.type() === 'continuous'"
                [class.dp-icon-ring--folded]="posture.type() === 'folded'"
              >
                <div class="dp-icon-inner">
                  <!-- Continuous — flat device -->
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.75"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    [style.opacity]="continuousOpacity()"
                  >
                    <rect x="5" y="2" width="14" height="20" rx="2" />
                    <line x1="12" y1="11" x2="12" y2="13" opacity="0.4" />
                  </svg>
                  <!-- Folded — two panels -->
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.75"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    [style.opacity]="foldedOpacity()"
                  >
                    <rect x="5" y="2" width="14" height="9" rx="2" />
                    <rect x="5" y="13" width="14" height="9" rx="2" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- Text -->
          <div class="dp-text">
            <h3 class="dp-title">{{ title() }}</h3>
            <p class="dp-subtitle">{{ subtitle() }}</p>
          </div>
        </div>
      </demo-card>
      }
    </ng-demo-wrapper>
  `,
  styles: `
    .dp-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding-top: 0.5rem;
      padding-bottom: 1.25rem;
    }

    /* ── Visual anchor ── */
    .dp-visual {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 0.5rem;
    }

    .dp-icon-ring-container {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 120px;
      height: 120px;
    }

    /* ── Icon ring ── */
    .dp-icon-ring {
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

    .dp-icon-ring--continuous {
      border-color: rgba(34, 197, 94, 0.3);
      background: rgba(34, 197, 94, 0.08);
    }

    .dp-icon-ring--folded {
      border-color: rgba(245, 158, 11, 0.3);
      background: rgba(245, 158, 11, 0.08);
    }

    /* ── Icons inside ring ── */
    .dp-icon-inner {
      position: relative;
      width: 26px;
      height: 26px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #DEB3EB;
    }

    .dp-icon-ring--continuous .dp-icon-inner { color: #22c55e; }
    .dp-icon-ring--folded .dp-icon-inner     { color: #f59e0b; }

    .dp-icon-inner svg {
      position: absolute;
      transition: opacity 0.4s ease;
    }

    /* ── Typography ── */
    .dp-text {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .dp-title {
      font-size: 1.125rem;
      font-weight: 600;
      margin: 0 0 0.375rem 0;
      text-align: center;
      letter-spacing: -0.01em;
      color: #eee;
    }

    .dp-subtitle {
      font-size: 0.8125rem;
      font-weight: 400;
      color: #71717a;
      margin: 0;
      text-align: center;
      line-height: 1.5;
    }
  `,
})
export class DevicePostureDemo {
  readonly posture = devicePosture();

  readonly importCode = `import { devicePosture } from '@signality/core'`;

  readonly title = computed(() => (this.posture.type() === 'folded' ? 'Folded' : 'Continuous'));

  readonly subtitle = computed(() =>
    this.posture.type() === 'folded' ? 'Device screen is folded' : 'Device is in flat open position'
  );

  readonly continuousOpacity = computed(() => (this.posture.type() === 'continuous' ? 1 : 0));
  readonly foldedOpacity = computed(() => (this.posture.type() === 'folded' ? 1 : 0));
}

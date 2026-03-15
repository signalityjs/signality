import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { screenOrientation } from '@signality/core/browser/screen-orientation';
import { DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-screen-orientation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard],
  template: `
    <ng-demo-wrapper [demoPath]="'screen-orientation/screen-orientation-demo'" [code]="importCode">
      <demo-card>
        <!-- Phone icon — rotates to reflect orientation -->
        <div class="so-visual">
          <div class="so-phone-wrap" [style.transform]="'rotate(' + rotation() + 'deg)'">
            <svg
              width="36"
              height="48"
              viewBox="0 0 24 32"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="3" y="1" width="18" height="30" rx="3" />
              <line x1="10" y1="4" x2="14" y2="4" />
              <circle cx="12" cy="28" r="1.25" fill="currentColor" stroke="none" />
            </svg>
          </div>
        </div>

        <!-- Divider + rows -->
        <div class="so-divider"></div>
        <div class="so-rows">
          <div class="so-row">
            <span class="so-label">Type</span>
            <span class="so-value">{{ orientationType() }}</span>
          </div>

          <div class="so-row so-row--last">
            <span class="so-label">Variant</span>
            <span class="so-value so-value--tag">{{ orientationVariant() }}</span>
          </div>
        </div>
      </demo-card>
    </ng-demo-wrapper>
  `,
  styles: `
    /* ── Visual ── */
    .so-visual {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 0.75rem 0 1rem;
    }

    .so-phone-wrap {
      color: #71717a;
      transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
    }

    /* ── Divider ── */
    .so-divider {
      height: 1px;
      background: #1f1f22;
      margin-bottom: 0;
    }

    /* ── Rows ── */
    .so-rows {
      display: flex;
      flex-direction: column;
    }

    .so-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.625rem 0;
      border-bottom: 1px solid #1f1f22;
      gap: 1rem;
    }

    .so-row:first-child {
      padding-top: 0.75rem;
    }

    .so-row--last {
      border-bottom: none;
      padding-bottom: 0;
    }

    .so-label {
      font-size: 0.8125rem;
      color: #71717a;
      flex-shrink: 0;
    }

    .so-value {
      font-size: 0.8125rem;
      color: #a1a1aa;
      font-weight: 500;
      text-transform: capitalize;
    }

    .so-value--tag {
      font-family: 'SF Mono', 'Fira Code', 'Roboto Mono', monospace;
      font-size: 0.75rem;
      color: #71717a;
      font-weight: 400;
      text-transform: lowercase;
    }
  `,
})
export class ScreenOrientationDemo {
  readonly orientation = screenOrientation();

  readonly importCode = `import { screenOrientation } from '@signality/core'`;

  readonly rotation = computed(() => {
    switch (this.orientation()) {
      case 'portrait-primary':
        return 0;
      case 'landscape-primary':
        return 90;
      case 'portrait-secondary':
        return 180;
      case 'landscape-secondary':
        return 270;
      default:
        return 0;
    }
  });

  readonly orientationType = computed(() =>
    this.orientation().startsWith('portrait') ? 'Portrait' : 'Landscape'
  );

  readonly orientationVariant = computed(() =>
    this.orientation().endsWith('primary') ? 'primary' : 'secondary'
  );
}

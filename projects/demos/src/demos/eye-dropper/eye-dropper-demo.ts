import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { eyeDropper } from '@signality/core/browser/eye-dropper';
import { DemoButton, DemoCard, DemoBadge, Wrapper } from '../../common';

@Component({
  selector: 'demo-eye-dropper',
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoButton, DemoCard, DemoBadge],
  template: `
    <ng-demo-wrapper [code]="importCode">
      @if (!eyeDropperRef.isSupported()) {
      <div class="not-supported">
        <demo-badge type="error">EyeDropper API not supported</demo-badge>
        <p class="not-supported-text">The EyeDropper API is not supported in this browser.</p>
      </div>
      } @if (eyeDropperRef.isSupported()) {
      <div class="eyedropper-card">
        <div class="eyedropper-main">
          <div
            class="color-preview"
            [style.background-color]="eyeDropperRef.sRGBHex() || '#232125'"
          >
            @if (!eyeDropperRef.sRGBHex()) {
            <span class="color-placeholder">No color</span>
            }
          </div>
          <div class="eyedropper-info">
            <span class="eyedropper-hex">
              {{ eyeDropperRef.sRGBHex() || '---' }}
            </span>
            <demo-button variant="primary" (click)="pickColor()"> Pick Color </demo-button>
          </div>
        </div>

        <demo-card>
          <div class="color-info">
            <span class="color-label">Selected Color</span>
            <span class="color-value">{{ eyeDropperRef.sRGBHex() || 'No color selected' }}</span>
          </div>
        </demo-card>
      </div>
      }
    </ng-demo-wrapper>
  `,
  styles: `
    .not-supported {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      padding: 2rem;
      text-align: center;
    }

    .not-supported-text {
      color: #a1a1aa;
      font-size: 0.875rem;
      margin: 0;
    }

    .eyedropper-card {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .eyedropper-main {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .color-preview {
      width: 5rem;
      height: 5rem;
      border-radius: 12px;
      border: 1px solid #3f3f46;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .color-placeholder {
      font-size: 0.625rem;
      color: #71717a;
      text-align: center;
    }

    .eyedropper-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      align-items: flex-start;
    }

    .eyedropper-hex {
      font-size: 1.5rem;
      font-weight: 600;
      color: #e4e4e7;
      font-family: 'SF Mono', Monaco, 'Courier New', monospace;
      letter-spacing: 0.025em;
    }

    .color-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .color-label {
      font-size: 0.75rem;
      font-weight: 500;
      color: #a1a1aa;
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }

    .color-value {
      font-size: 0.9375rem;
      font-weight: 500;
      color: #e4e4e7;
      font-family: 'SF Mono', Monaco, 'Courier New', monospace;
    }
  `,
})
export class EyeDropperDemo {
  readonly eyeDropperRef = eyeDropper();

  readonly importCode = `import { eyeDropper } from '@signality/core'`;

  async pickColor(): Promise<void> {
    await this.eyeDropperRef.open();
  }
}

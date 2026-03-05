import { ChangeDetectionStrategy, Component } from '@angular/core';
import { displayMedia } from '@signality/core/browser/display-media';
import { DemoBadge, DemoButton, DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-display-media',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard, DemoButton, DemoBadge],
  template: `
    <ng-demo-wrapper [code]="importCode">
      <div class="display-card">
        @if (!dm.isSupported()) {
        <demo-card>
          <div class="not-supported">
            <demo-badge type="error">Display Media not supported</demo-badge>
            <p class="not-supported-text">Use a browser with Screen Capture API support.</p>
          </div>
        </demo-card>
        } @else {
        <div class="preview-area">
          @if (dm.stream()) {
          <video
            #video
            [srcObject]="dm.stream()"
            autoplay
            muted
            playsinline
            class="preview-video"
          ></video>
          } @else {
          <span class="preview-hint">Click to start capture</span>
          }
        </div>

        <demo-card>
          <div class="status-row">
            <span class="status-label">Status</span>
            <demo-badge [type]="dm.isActive() ? 'success' : 'neutral'">
              {{ dm.isActive() ? 'Capturing' : 'Idle' }}
            </demo-badge>
          </div>
        </demo-card>

        @if (dm.error()) {
        <demo-card>
          <demo-badge type="error">{{ dm.error()?.message }}</demo-badge>
        </demo-card>
        }

        <demo-button variant="primary" (click)="toggleCapture()">
          {{ dm.isActive() ? 'Stop Capture' : 'Start Capture' }}
        </demo-button>
        }
      </div>
    </ng-demo-wrapper>
  `,
  styles: `
    .display-card {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .not-supported {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      text-align: center;
    }

    .not-supported-text {
      color: #a1a1aa;
      font-size: 0.875rem;
      margin: 0;
    }

    .preview-area {
      height: 120px;
      background: #0f0f11;
      border-radius: 8px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .preview-video {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .preview-hint {
      font-size: 0.875rem;
      color: #71717a;
    }

    .status-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .status-label {
      font-size: 0.875rem;
      font-weight: 500;
      color: #a1a1aa;
    }
  `,
})
export class DisplayMediaDemo {
  readonly dm = displayMedia();

  readonly importCode = `import { displayMedia } from '@signality/core'`;

  async toggleCapture(): Promise<void> {
    if (this.dm.isActive()) {
      this.dm.stop();
    } else {
      await this.dm.start();
    }
  }
}

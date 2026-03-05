import { ChangeDetectionStrategy, Component } from '@angular/core';
import { webShare } from '@signality/core/browser/web-share';
import { DemoBadge, DemoButton, DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-web-share',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard, DemoButton, DemoBadge],
  template: `
    <ng-demo-wrapper [code]="importCode">
      <div class="share-card">
        @if (!shareAPI.isSupported()) {
        <demo-card>
          <div class="not-supported">
            <demo-badge type="error">Web Share API not supported</demo-badge>
            <p class="not-supported-text">Use a mobile device or desktop browser with Share API.</p>
          </div>
        </demo-card>
        } @else {
        <demo-button variant="primary" (click)="share()" [disabled]="shareAPI.isSharing()">
          {{ shareAPI.isSharing() ? 'Sharing...' : 'Share' }}
        </demo-button>
        }
      </div>
    </ng-demo-wrapper>
  `,
  styles: `
    .share-card {
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
export class WebShareDemo {
  readonly shareAPI = webShare();

  readonly importCode = `import { webShare } from '@signality/core'`;

  async share(): Promise<void> {
    await this.shareAPI.share({
      title: 'Signality',
      text: 'Check out Signality - reactive utilities for Angular!',
      url: 'https://signality.dev',
    });
  }
}

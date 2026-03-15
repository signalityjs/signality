import { ChangeDetectionStrategy, Component } from '@angular/core';
import { webShare } from '@signality/core/browser/web-share';
import { DemoCard, DemoNotSupported, Wrapper } from '../../common';

@Component({
  selector: 'demo-web-share',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard, DemoNotSupported],
  template: `
    <ng-demo-wrapper [demoPath]="'web-share/web-share-demo'" [code]="importCode">
      @if (!webShare.isSupported()) {
      <demo-not-supported
        title="Not supported"
        description="Web Share API is not available in this browser."
        [hints]="['Chrome', 'Safari', 'Mobile']"
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
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
      </demo-not-supported>
      } @else {
      <demo-card>
        <!-- Share data rows -->
        <div class="ws-rows">
          <div class="ws-row">
            <span class="ws-label">Title</span>
            <span class="ws-value">Signality</span>
          </div>
          <div class="ws-row">
            <span class="ws-label">Text</span>
            <span class="ws-value ws-value--muted">Reactive utilities for Angular</span>
          </div>
          <div class="ws-row ws-row--last">
            <span class="ws-label">URL</span>
            <span class="ws-value ws-value--tag">signality.dev</span>
          </div>
        </div>

        <!-- Divider + footer -->
        <div class="ws-divider"></div>
        <div class="ws-footer">
          <span class="ws-status" [class.ws-status--sharing]="webShare.isSharing()">
            <span class="ws-pulse" [class.ws-pulse--active]="webShare.isSharing()"></span>
            {{ webShare.isSharing() ? 'Sharing…' : 'Ready to share' }}
          </span>
          <button class="ws-btn" [disabled]="webShare.isSharing()" (click)="share()">Share</button>
        </div>
      </demo-card>
      }
    </ng-demo-wrapper>
  `,
  styles: `
    /* ── Rows ── */
    .ws-rows {
      display: flex;
      flex-direction: column;
    }

    .ws-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.625rem 0;
      border-bottom: 1px solid #1f1f22;
      gap: 1rem;
    }

    .ws-row--last {
      border-bottom: none;
      padding-bottom: 0;
    }

    .ws-row:first-child {
      padding-top: 0;
    }

    .ws-label {
      font-size: 0.8125rem;
      color: #71717a;
      flex-shrink: 0;
    }

    .ws-value {
      font-size: 0.8125rem;
      color: #a1a1aa;
      font-weight: 500;
      text-align: right;
    }

    .ws-value--muted {
      color: #a1a1aa;
      font-weight: 400;
    }

    .ws-value--tag {
      font-family: 'SF Mono', 'Fira Code', 'Roboto Mono', monospace;
      font-size: 0.75rem;
      color: #71717a;
      font-weight: 400;
    }

    /* ── Divider ── */
    .ws-divider {
      height: 1px;
      background: #1f1f22;
      margin: 0.875rem 0 0;
    }

    /* ── Footer ── */
    .ws-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 0.75rem;
    }

    .ws-status {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8125rem;
      color: #71717a;
      transition: color 0.2s ease;
    }

    .ws-status--sharing {
      color: #71717a;
    }

    /* ── Pulse indicator ── */
    .ws-pulse {
      position: relative;
      width: 6px;
      height: 6px;
      flex-shrink: 0;
    }

    .ws-pulse::before,
    .ws-pulse::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: #3f3f46;
      transition: background 0.3s ease;
    }

    .ws-pulse--active::before {
      background: #DEB3EB;
    }

    .ws-pulse--active::after {
      background: #DEB3EB;
      animation: wsPulse 1.2s ease-out infinite;
    }

    @keyframes wsPulse {
      0%   { transform: scale(1); opacity: 0.6; }
      100% { transform: scale(3); opacity: 0; }
    }

    .ws-btn {
      font-size: 0.8125rem;
      font-family: inherit;
      color: #DEB3EB;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
      transition: color 0.15s ease;
    }

    .ws-btn:hover:not(:disabled) {
      color: #e8c8f5;
    }

    .ws-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  `,
})
export class WebShareDemo {
  readonly webShare = webShare();

  readonly importCode = `import { webShare } from '@signality/core'`;

  async share(): Promise<void> {
    await this.webShare.share({
      title: 'Signality',
      text: 'Reactive utilities for Angular',
      url: 'https://signality.dev',
    });
  }
}

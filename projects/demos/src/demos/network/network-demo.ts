import { ChangeDetectionStrategy, Component } from '@angular/core';
import { network } from '@signality/core/browser/network';
import { DemoBadge, DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-network',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard, DemoBadge],
  template: `
    <ng-demo-wrapper [code]="importCode">
      @if (!net.isSupported()) {
      <div class="not-supported">
        <demo-badge type="error">Network Information API not supported</demo-badge>
        <p class="not-supported-text">
          The Network Information API is not supported in this browser.
        </p>
      </div>
      } @if (net.isSupported()) {
      <div class="network-card">
        <demo-card>
          <div class="connection-type">
            <div class="connection-icon">
              @switch (net.type()) { @case ('wifi') {
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M5 12.55a11 11 0 0 1 14.08 0"></path>
                <path d="M1.42 9a16 16 0 0 1 21.16 0"></path>
                <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
                <line x1="12" y1="20" x2="12.01" y2="20"></line>
              </svg>
              } @case ('cellular') {
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <rect x="5" y="2" width="4" height="16" rx="1"></rect>
                <rect x="10" y="6" width="4" height="12" rx="1"></rect>
                <rect x="15" y="10" width="4" height="8" rx="1"></rect>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
              } @case ('ethernet') {
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <rect x="2" y="6" width="20" height="12" rx="2"></rect>
                <line x1="6" y1="10" x2="6" y2="14"></line>
                <line x1="10" y1="10" x2="10" y2="14"></line>
                <line x1="14" y1="10" x2="14" y2="14"></line>
                <line x1="18" y1="10" x2="18" y2="14"></line>
              </svg>
              } @default {
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              } }
            </div>
            <div class="connection-info">
              <span class="connection-label">Connection Type</span>
              <span class="connection-value">{{ net.type() || 'Unknown' }}</span>
            </div>
          </div>
        </demo-card>

        <demo-card>
          <div class="network-details">
            <div class="detail-item">
              <span class="detail-label">Effective Type</span>
              <span class="detail-value">{{ net.effectiveType() || '-' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Downlink</span>
              <span class="detail-value">{{
                net.downlink() !== undefined ? net.downlink() + ' Mbps' : '-'
              }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">RTT</span>
              <span class="detail-value">{{
                net.rtt() !== undefined ? net.rtt() + ' ms' : '-'
              }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Save Data</span>
              <span class="detail-value">{{ net.saveData() ? 'Enabled' : 'Disabled' }}</span>
            </div>
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

    .network-card {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .connection-type {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .connection-icon {
      width: 4rem;
      height: 4rem;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
      background: #232125;
      color: #DEB3EB;
    }

    .connection-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .connection-label {
      font-size: 0.75rem;
      font-weight: 500;
      color: #a1a1aa;
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }

    .connection-value {
      font-size: 1.25rem;
      font-weight: 600;
      color: #e4e4e7;
      text-transform: capitalize;
    }

    .network-details {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .detail-label {
      font-size: 0.75rem;
      font-weight: 500;
      color: #a1a1aa;
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }

    .detail-value {
      font-size: 0.9375rem;
      font-weight: 500;
      color: #e4e4e7;
    }
  `,
})
export class NetworkDemo {
  readonly net = network();

  readonly importCode = `import { network } from '@signality/core'`;
}

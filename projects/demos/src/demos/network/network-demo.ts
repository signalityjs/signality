import { ChangeDetectionStrategy, Component } from '@angular/core';
import { network } from '@signality/core/browser/network';
import { DemoCard, DemoNotSupported, Wrapper } from '../../common';

@Component({
  selector: 'demo-network',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard, DemoNotSupported],
  template: `
    <ng-demo-wrapper [demoPath]="'network/network-demo'" [code]="importCode">
      @if (!net.isSupported()) {
      <demo-not-supported
        title="Not supported"
        description="Network Information API is not available in this browser."
        [hints]="['Chrome', 'Edge', 'Android']"
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
          <path d="M5 12.55a11 11 0 0 1 14.08 0" />
          <path d="M1.42 9a16 16 0 0 1 21.16 0" />
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
          <line x1="12" y1="20" x2="12.01" y2="20" />
        </svg>
      </demo-not-supported>
      } @else {
      <demo-card>
        <div class="nw-rows">
          <div class="nw-row">
            <span class="nw-label">Connection</span>
            <span class="nw-value nw-value--type">{{ net.type() || '—' }}</span>
          </div>

          <div class="nw-row">
            <span class="nw-label">Effective type</span>
            <span class="nw-value nw-value--tag">{{ net.effectiveType() || '—' }}</span>
          </div>

          <div class="nw-row">
            <span class="nw-label">Downlink</span>
            <span class="nw-value">{{
              net.downlink() != null ? net.downlink() + ' Mbps' : '—'
            }}</span>
          </div>

          <div class="nw-row">
            <span class="nw-label">RTT</span>
            <span class="nw-value">{{ net.rtt() != null ? net.rtt() + ' ms' : '—' }}</span>
          </div>

          <div class="nw-row nw-row--last">
            <span class="nw-label">Save data</span>
            <span class="nw-value" [class.nw-value--on]="net.saveData()">
              {{ net.saveData() ? 'Enabled' : 'Disabled' }}
            </span>
          </div>
        </div>
      </demo-card>
      }
    </ng-demo-wrapper>
  `,
  styles: `
    .nw-rows {
      display: flex;
      flex-direction: column;
    }

    .nw-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.625rem 0;
      border-bottom: 1px solid #1f1f22;
    }

    .nw-row--last {
      border-bottom: none;
      padding-bottom: 0;
    }

    .nw-row:first-child {
      padding-top: 0;
    }

    .nw-label {
      font-size: 0.8125rem;
      color: #71717a;
    }

    .nw-value {
      font-size: 0.8125rem;
      color: #a1a1aa;
      font-weight: 500;
    }

    .nw-value--type {
      text-transform: capitalize;
    }

    .nw-value--tag {
      font-family: 'SF Mono', 'Fira Code', 'Roboto Mono', monospace;
      font-size: 0.75rem;
      color: #71717a;
      font-weight: 400;
      text-transform: lowercase;
    }

    .nw-value--on {
      color: #22c55e;
    }
  `,
})
export class NetworkDemo {
  readonly net = network();

  readonly importCode = `import { network } from '@signality/core'`;
}

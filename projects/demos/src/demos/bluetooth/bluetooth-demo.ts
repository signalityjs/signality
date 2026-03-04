import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { bluetooth } from '@signality/core/browser/bluetooth';
import { DemoBadge, DemoButton, DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-bluetooth',
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard, DemoButton, DemoBadge],
  template: `
    <ng-demo-wrapper [code]="importCode">
      <div class="bluetooth-demo">
        @if (!bt.isSupported()) {
        <demo-card>
          <div class="not-supported">
            <demo-badge type="error">Web Bluetooth not supported</demo-badge>
            <p class="not-supported-text">Use Chrome/Edge on desktop or Android.</p>
          </div>
        </demo-card>
        } @else {
        <demo-card>
          <div class="status-row">
            <span class="status-label">Status</span>
            <demo-badge [type]="getStatusType()">
              {{ getStatusText() }}
            </demo-badge>
          </div>
        </demo-card>

        @if (bt.device()) {
        <demo-card>
          <div class="device-info">
            <div class="device-name">{{ bt.device()?.name || 'Unknown Device' }}</div>
            <div class="device-id">{{ bt.device()?.id }}</div>
          </div>
        </demo-card>
        } @if (bt.error()) {
        <demo-card>
          <demo-badge type="error">{{ bt.error()?.message }}</demo-badge>
        </demo-card>
        }

        <div class="controls">
          @if (bt.isConnected()) {
          <demo-button variant="secondary" (click)="bt.disconnect()">Disconnect</demo-button>
          } @else {
          <demo-button variant="primary" (click)="connect()" [disabled]="bt.isConnecting()">
            {{ bt.isConnecting() ? 'Connecting...' : 'Connect Device' }}
          </demo-button>
          }
        </div>
        }
      </div>
    </ng-demo-wrapper>
  `,
  styles: `
    .bluetooth-demo {
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

    .device-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .device-name {
      font-size: 0.875rem;
      font-weight: 500;
      color: #e4e4e7;
    }

    .device-id {
      font-size: 0.625rem;
      color: #71717a;
      word-break: break-all;
      font-family: monospace;
    }

    .controls {
      display: flex;
      justify-content: center;
    }
  `,
})
export class BluetoothDemo {
  readonly bt = bluetooth();

  readonly importCode = `import { bluetooth } from '@signality/core'`;

  getStatusType(): 'success' | 'warning' | 'error' | 'neutral' {
    if (this.bt.error()) return 'error';
    if (this.bt.isConnecting()) return 'warning';
    if (this.bt.isConnected()) return 'success';
    return 'neutral';
  }

  getStatusText(): string {
    if (this.bt.error()) return 'Error';
    if (this.bt.isConnecting()) return 'Connecting...';
    if (this.bt.isConnected()) return 'Connected';
    return 'Idle';
  }

  async connect(): Promise<void> {
    await this.bt.request();
  }
}

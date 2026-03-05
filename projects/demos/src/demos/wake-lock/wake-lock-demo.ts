import { ChangeDetectionStrategy, Component } from '@angular/core';
import { wakeLock } from '@signality/core/browser/wake-lock';
import { DemoBadge, DemoButton, DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-wake-lock',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard, DemoButton, DemoBadge],
  template: `
    <ng-demo-wrapper [code]="importCode">
      <div class="wake-lock-card">
        @if (!wakeLock.isSupported()) {
        <demo-card>
          <div class="not-supported">
            <demo-badge type="error">Wake Lock API not supported</demo-badge>
            <p class="not-supported-text">Use a secure context (HTTPS) in a supported browser.</p>
          </div>
        </demo-card>
        } @else {
        <demo-card>
          <div class="status-row">
            <span class="status-label">Status</span>
            <demo-badge [type]="wakeLock.isActive() ? 'success' : 'neutral'">
              {{ wakeLock.isActive() ? 'Active' : 'Inactive' }}
            </demo-badge>
          </div>
        </demo-card>

        <div class="controls">
          @if (wakeLock.isActive()) {
          <demo-button variant="secondary" (click)="wakeLock.release()">Release</demo-button>
          } @else {
          <demo-button variant="primary" (click)="wakeLock.request()">Request Lock</demo-button>
          }
        </div>
        }
      </div>
    </ng-demo-wrapper>
  `,
  styles: `
    .wake-lock-card {
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

    .controls {
      display: flex;
      justify-content: center;
    }
  `,
})
export class WakeLockDemo {
  readonly wakeLock = wakeLock();

  readonly importCode = `import { wakeLock } from '@signality/core'`;
}

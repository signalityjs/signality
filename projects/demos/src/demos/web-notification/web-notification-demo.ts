import { ChangeDetectionStrategy, Component } from '@angular/core';
import { webNotification } from '@signality/core/browser/web-notification';
import { DemoBadge, DemoButton, DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-web-notification',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard, DemoButton, DemoBadge],
  template: `
    <ng-demo-wrapper [code]="importCode">
      <div class="notification-card">
        @if (!notif.isSupported()) {
        <demo-card>
          <div class="not-supported">
            <demo-badge type="error">Notifications API not supported</demo-badge>
            <p class="not-supported-text">Use a browser with Notifications API support.</p>
          </div>
        </demo-card>
        } @else {
        <demo-card>
          <div class="status-row">
            <span class="status-label">Permission</span>
            <demo-badge [type]="getPermissionType()">
              {{ notif.permission() }}
            </demo-badge>
          </div>
        </demo-card>

        <div class="controls">
          @if (notif.permission() === 'default') {
          <demo-button variant="primary" (click)="requestPermission()">
            Request Permission
          </demo-button>
          } @else if (notif.permission() === 'granted') {
          <demo-button variant="primary" (click)="showNotification()">
            Show Notification
          </demo-button>
          }
        </div>
        }
      </div>
    </ng-demo-wrapper>
  `,
  styles: `
    .notification-card {
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

      &:empty {
        display: none;
      }
    }
  `,
})
export class WebNotificationDemo {
  readonly notif = webNotification();

  readonly importCode = `import { webNotification } from '@signality/core'`;

  getPermissionType(): 'success' | 'warning' | 'error' | 'neutral' {
    const perm = this.notif.permission();
    if (perm === 'granted') return 'success';
    if (perm === 'denied') return 'error';
    return 'warning';
  }

  async requestPermission(): Promise<void> {
    await this.notif.requestPermission();
  }

  showNotification(): void {
    this.notif.show('Hello!', {
      body: 'This is a notification from Signality!',
      icon: 'https://signality.dev/favicon.ico',
    });
  }
}

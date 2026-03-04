import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { online } from '@signality/core/browser/online';
import { DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-online',
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard],
  template: `
    <ng-demo-wrapper [code]="importCode">
      <div class="online-card">
        <demo-card>
          <div class="status-display">
            <div class="status-icon" [class.online]="isOnline()" [class.offline]="!isOnline()">
              @if (isOnline()) {
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
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
              } @else {
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <line x1="1" y1="1" x2="23" y2="23"></line>
                <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path>
                <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path>
                <path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path>
                <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path>
                <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
                <line x1="12" y1="20" x2="12.01" y2="20"></line>
              </svg>
              }
            </div>
            <span class="status-text">{{ isOnline() ? 'Online' : 'Offline' }}</span>
          </div>
        </demo-card>
      </div>
    </ng-demo-wrapper>
  `,
  styles: `
    .online-card {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .status-display {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      padding: 1rem 0;
    }

    .status-icon {
      width: 5rem;
      height: 5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: #232125;
    }

    .status-icon.online {
      color: #22c55e;
      background: rgba(34, 197, 94, 0.1);
    }

    .status-icon.offline {
      color: #ef4444;
      background: rgba(239, 68, 68, 0.1);
    }

    .status-text {
      font-size: 1.5rem;
      font-weight: 700;
      color: #e4e4e7;
    }
  `,
})
export class OnlineDemo {
  readonly isOnline = online();

  readonly importCode = `import { online } from '@signality/core'`;
}

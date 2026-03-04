import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { pageVisibility } from '@signality/core/browser/page-visibility';
import { DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-page-visibility',
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard],
  template: `
    <ng-demo-wrapper [code]="importCode">
      <div class="visibility-card">
        <demo-card>
          <div class="status-display">
            <div
              class="status-icon"
              [class.visible]="visibility() === 'visible'"
              [class.hidden]="visibility() === 'hidden'"
            >
              @if (visibility() === 'visible') {
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
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
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
                <path
                  d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
                ></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
              }
            </div>
            <span class="status-text">{{ visibility() === 'visible' ? 'Visible' : 'Hidden' }}</span>
            <span class="status-hint">Switch tabs or minimize to see changes</span>
          </div>
        </demo-card>
      </div>
    </ng-demo-wrapper>
  `,
  styles: `
    .visibility-card {
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

    .status-icon.visible {
      color: #22c55e;
      background: rgba(34, 197, 94, 0.1);
    }

    .status-icon.hidden {
      color: #ef4444;
      background: rgba(239, 68, 68, 0.1);
    }

    .status-text {
      font-size: 1.5rem;
      font-weight: 700;
      color: #e4e4e7;
    }

    .status-hint {
      font-size: 0.75rem;
      color: #71717a;
      text-align: center;
    }
  `,
})
export class PageVisibilityDemo {
  readonly visibility = pageVisibility();

  readonly importCode = `import { pageVisibility } from '@signality/core'`;
}

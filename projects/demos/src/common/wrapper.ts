import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ng-demo-wrapper',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="demo-title">
      <svg class="demo-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
      </svg>
      <span>Demo</span>
    </div>
    <ng-content />
  `,
  styles: `
    :host {
      display: block;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #161618;
      border: 1px solid #232125;
      border-radius: 10px;
      padding: 1.5rem;
      color: #e4e4e7;
    }

    .demo-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      font-weight: 600;
      color: #a1a1aa;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-top: -0.25rem;
      margin-bottom: 1.5rem;
    }

    .demo-icon {
      color: #a1a1aa;
      flex-shrink: 0;
    }
  `,
})
export class Wrapper {}

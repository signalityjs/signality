import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';

@Component({
  selector: 'ng-demo-wrapper',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="demo-header">
      <div class="demo-title">
        <svg
          class="demo-icon"
          width="16"
          height="16"
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
        <span>Demo</span>
      </div>
      @if (code()) {
      <button class="copy-btn" (click)="copyCode()" [class.copied]="copied()">
        @if (copied()) {
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span>Copied!</span>
        } @else {
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
        <span>Copy</span>
        }
      </button>
      }
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

    .demo-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;
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
      margin-top: -0.375rem;
    }

    .demo-icon {
      color: #a1a1aa;
      flex-shrink: 0;
    }

    .copy-btn {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      block-size: 2rem;
      padding: 0 0.625rem;
      font-size: 0.75rem;
      font-weight: 500;
      color: #a1a1aa;
      background: transparent;
      border: 1px solid #232125;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .copy-btn:hover {
      color: #e4e4e7;
      background: #1a1a1d;
      border-color: #27272a;
    }

    .copy-btn.copied {
      color: #22c55e;
      border-color: rgba(34, 197, 94, 0.3);
      background: rgba(34, 197, 94, 0.1);
    }
  `,
})
export class Wrapper {
  readonly code = input('');
  readonly copied = signal(false);

  async copyCode(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.code());
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }
}

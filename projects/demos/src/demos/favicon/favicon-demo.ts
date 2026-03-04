import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { favicon } from '@signality/core/browser/favicon';
import { DemoButton, DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-favicon',
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoButton, DemoCard],
  template: `
    <ng-demo-wrapper [code]="importCode">
      <div class="favicon-card">
        <div class="favicon-preview">
          @if (faviconRef.current()) {
          <img [src]="faviconRef.current()" alt="Favicon" class="favicon-img" />
          } @else {
          <div class="favicon-placeholder">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4l2 2" />
            </svg>
          </div>
          }
        </div>

        <demo-card>
          <div class="preset-section">
            <span class="preset-label">Presets</span>
            <div class="preset-grid">
              <button class="preset-btn" (click)="setEmoji('🔴')">🔴</button>
              <button class="preset-btn" (click)="setEmoji('🟢')">🟢</button>
              <button class="preset-btn" (click)="setEmoji('🔵')">🔵</button>
              <button class="preset-btn" (click)="setEmoji('⭐')">⭐</button>
              <button class="preset-btn" (click)="setEmoji('🔥')">🔥</button>
              <button class="preset-btn" (click)="setEmoji('💀')">💀</button>
            </div>
          </div>
        </demo-card>

        <demo-button variant="ghost" size="sm" (click)="reset()">Reset</demo-button>
      </div>
    </ng-demo-wrapper>
  `,
  styles: `
    .favicon-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .favicon-preview {
      width: 64px;
      height: 64px;
      border-radius: 16px;
      background: #0f0f11;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      border: 1px solid #27272a;
    }

    .favicon-img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .favicon-placeholder {
      color: #3f3f46;
    }

    .preset-section {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .preset-label {
      font-size: 0.75rem;
      font-weight: 500;
      color: #71717a;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .preset-grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 0.375rem;
    }

    .preset-btn {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      background: #27272a;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .preset-btn:hover {
      background: #3f3f46;
      transform: scale(1.1);
    }
  `,
})
export class FaviconDemo {
  readonly faviconRef = favicon();

  readonly importCode = `import { favicon } from '@signality/core'`;

  setEmoji(emoji: string): void {
    this.faviconRef.setEmoji(emoji);
  }

  reset(): void {
    this.faviconRef.reset();
  }
}

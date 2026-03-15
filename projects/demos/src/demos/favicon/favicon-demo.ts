import { ChangeDetectionStrategy, Component } from '@angular/core';
import { favicon } from '@signality/core/browser/favicon';
import { DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-favicon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard],
  template: `
    <ng-demo-wrapper [demoPath]="'favicon/favicon-demo'" [code]="importCode">
      <demo-card>
        <!-- Emoji grid -->
        <div class="fv-grid">
          @for (emoji of emojis; track emoji) {
          <button class="fv-btn" (click)="setEmoji(emoji)">{{ emoji }}</button>
          }
        </div>

        <!-- Divider + footer -->
        <div class="fv-divider"></div>
        <div class="fv-footer">
          <div class="fv-preview">
            @if (faviconRef.current()) {
            <img [src]="faviconRef.current()" alt="favicon" class="fv-img" />
            } @else {
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
            </svg>
            }
            <span class="fv-status">{{
              faviconRef.current() ? 'Custom favicon set' : 'Default favicon'
            }}</span>
          </div>
          <button class="fv-reset" [disabled]="!faviconRef.current()" (click)="reset()">
            Reset
          </button>
        </div>
      </demo-card>
    </ng-demo-wrapper>
  `,
  styles: `
    /* ── Emoji grid ── */
    .fv-grid {
      display: flex;
      gap: 0.375rem;
    }

    .fv-btn {
      flex: 1;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.125rem;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid #27272a;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.15s ease, transform 0.1s ease, border-color 0.15s ease;
      line-height: 1;
    }

    .fv-btn:hover {
      background: rgba(255, 255, 255, 0.07);
      border-color: #3f3f46;
      transform: scale(1.08);
    }

    .fv-btn:active {
      transform: scale(0.96);
    }

    /* ── Divider ── */
    .fv-divider {
      height: 1px;
      background: #1f1f22;
      margin: 0.875rem 0 0;
    }

    /* ── Footer ── */
    .fv-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 0.75rem;
    }

    .fv-preview {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #3f3f46;
    }

    .fv-img {
      width: 14px;
      height: 14px;
      object-fit: contain;
    }

    .fv-status {
      font-size: 0.8125rem;
      color: #71717a;
    }

    .fv-reset {
      font-size: 0.8125rem;
      font-family: inherit;
      color: #52525b;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
      transition: color 0.15s ease;
    }

    .fv-reset:hover:not(:disabled) {
      color: #a1a1aa;
    }

    .fv-reset:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }
  `,
})
export class FaviconDemo {
  readonly faviconRef = favicon();
  readonly emojis = ['🔴', '🟢', '🔵', '⭐', '🔥', '💀'];

  readonly importCode = `import { favicon } from '@signality/core'`;

  setEmoji(emoji: string): void {
    this.faviconRef.setEmoji(emoji);
  }

  reset(): void {
    this.faviconRef.reset();
  }
}

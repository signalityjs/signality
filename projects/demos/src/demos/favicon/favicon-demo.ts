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
          <img [src]="faviconRef.current()" alt="Current favicon" class="favicon-img" />
          } @else {
          <span class="favicon-placeholder">No favicon</span>
          }
        </div>

        <demo-card>
          <div class="emoji-buttons">
            <span class="section-label">Quick Presets</span>
            <div class="emoji-row">
              <demo-button variant="secondary" size="sm" (click)="setEmoji('🔴')">🔴</demo-button>
              <demo-button variant="secondary" size="sm" (click)="setEmoji('🟢')">🟢</demo-button>
              <demo-button variant="secondary" size="sm" (click)="setEmoji('🔵')">🔵</demo-button>
              <demo-button variant="secondary" size="sm" (click)="setEmoji('⭐')">⭐</demo-button>
              <demo-button variant="secondary" size="sm" (click)="setEmoji('🔥')">🔥</demo-button>
              <demo-button variant="secondary" size="sm" (click)="setEmoji('💀')">💀</demo-button>
              <demo-button variant="secondary" size="sm" (click)="setEmoji('👻')">👻</demo-button>
              <demo-button variant="secondary" size="sm" (click)="setEmoji('🎉')">🎉</demo-button>
            </div>
          </div>
        </demo-card>

        <demo-button variant="ghost" (click)="reset()"> Reset to Original </demo-button>
      </div>
    </ng-demo-wrapper>
  `,
  styles: `
    .favicon-card {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      align-items: center;
    }

    .favicon-preview {
      width: 5rem;
      height: 5rem;
      border-radius: 12px;
      border: 1px solid #3f3f46;
      background: #161618;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .favicon-img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .favicon-placeholder {
      font-size: 0.625rem;
      color: #71717a;
      text-align: center;
    }

    .emoji-buttons {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      width: 100%;
    }

    .section-label {
      font-size: 0.75rem;
      font-weight: 500;
      color: #a1a1aa;
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }

    .emoji-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
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

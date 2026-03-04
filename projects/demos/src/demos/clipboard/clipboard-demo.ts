import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { clipboard } from '@signality/core/browser/clipboard';
import { DemoBadge, DemoButton, DemoCard, DemoInput, Wrapper } from '../../common';

@Component({
  selector: 'demo-clipboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoButton, DemoCard, DemoBadge, DemoInput, FormsModule],
  template: `
    <ng-demo-wrapper [code]="importCode">
      @if (!cb.isSupported()) {
      <div class="not-supported">
        <demo-badge type="error">Clipboard API not supported</demo-badge>
        <p class="not-supported-text">The Clipboard API is not supported in this browser.</p>
      </div>
      } @if (cb.isSupported()) {
      <div class="clipboard-card">
        <div class="input-row">
          <demo-input
            class="input-flex"
            placeholder="Enter text to copy..."
            [(ngModel)]="inputText"
          />
          <demo-button variant="primary" (click)="handleCopy()">
            @if (cb.copied()) {
            <span>Copied!</span>
            } @else {
            <span>Copy</span>
            }
          </demo-button>
        </div>

        <demo-card>
          <div class="clipboard-content">
            <div class="clipboard-header">
              <span class="clipboard-label">Current Clipboard</span>
              <demo-button variant="ghost" size="sm" (click)="handlePaste()"> Paste </demo-button>
            </div>
            <div class="clipboard-text">
              @if (cb.text()) {
              {{ cb.text() }}
              } @else {
              <span class="clipboard-empty">Empty</span>
              }
            </div>
          </div>
        </demo-card>
      </div>
      }
    </ng-demo-wrapper>
  `,
  styles: `
    .not-supported {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      padding: 2rem;
      text-align: center;
    }

    .not-supported-text {
      color: #a1a1aa;
      font-size: 0.875rem;
      margin: 0;
    }

    .clipboard-card {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .input-row {
      display: flex;
      gap: 0.75rem;
    }

    .input-flex {
      flex: 1;
    }

    .clipboard-content {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .clipboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .clipboard-label {
      font-size: 0.75rem;
      font-weight: 500;
      color: #a1a1aa;
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }

    .clipboard-text {
      font-size: 0.9375rem;
      color: #e4e4e7;
      background: #161618;
      padding: 0.75rem;
      border-radius: 6px;
      min-height: 2.5rem;
      word-break: break-all;
    }

    .clipboard-empty {
      color: #71717a;
      font-style: italic;
    }
  `,
})
export class ClipboardDemo {
  readonly cb = clipboard();

  readonly importCode = `import { clipboard } from '@signality/core'`;

  inputText = 'Hello, Signality!';

  async handleCopy(): Promise<void> {
    await this.cb.copy(this.inputText);
  }

  async handlePaste(): Promise<void> {
    await this.cb.paste();
  }
}

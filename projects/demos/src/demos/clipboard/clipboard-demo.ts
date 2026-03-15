import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { clipboard } from '@signality/core/browser/clipboard';
import { DemoButton, DemoCard, DemoNotSupported, Wrapper } from '../../common';

@Component({
  selector: 'demo-clipboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard, DemoButton, DemoNotSupported, FormsModule],
  template: `
    <ng-demo-wrapper [demoPath]="'clipboard/clipboard-demo'" [code]="importCode">
      @if (!cb.isSupported()) {
      <demo-not-supported
        title="Clipboard Not Available"
        description="Clipboard API requires a secure origin (HTTPS) and a modern browser."
        [hints]="['HTTPS required', 'Chrome 66+', 'Firefox 63+']"
      >
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <rect x="9" y="2" width="6" height="4" rx="1" />
          <path d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2" />
        </svg>
      </demo-not-supported>
      } @else {
      <demo-card>
        <div class="cp-wrap">
          <!-- Source textarea with inline copy button -->
          <div class="cp-source-wrap">
            <textarea
              class="cp-source"
              [(ngModel)]="text"
              rows="3"
              spellcheck="false"
              placeholder="Type something to copy…"
            ></textarea>
            <button
              class="cp-copy-btn"
              [class.cp-copy-btn--copied]="cb.copied()"
              [disabled]="!text"
              (click)="copy()"
            >
              @if (cb.copied()) {
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              } @else {
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              }
            </button>
          </div>

          <!-- Divider -->
          <div class="cp-divider"></div>

          <!-- Clipboard read section -->
          <div class="cp-clipboard">
            <div class="cp-clipboard-header">
              <span class="cp-label">Clipboard</span>
              <demo-button variant="ghost" size="sm" (click)="paste()">Paste</demo-button>
            </div>
            <div class="cp-clipboard-body">
              @if (cb.text()) {
              {{ cb.text() }}
              } @else {
              <span class="cp-empty">Nothing here yet</span>
              }
            </div>
          </div>
        </div>
      </demo-card>
      }
    </ng-demo-wrapper>
  `,
  styles: `
    .cp-wrap {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding-top: 0.25rem;
      padding-bottom: 0.25rem;
    }

    /* ── Source textarea ── */
    .cp-source-wrap {
      position: relative;
    }

    .cp-source {
      width: 100%;
      box-sizing: border-box;
      resize: none;
      background: #161618;
      border: 1px solid #27272a;
      border-radius: 8px;
      padding: 0.75rem;
      padding-right: 2.75rem;
      font-family: inherit;
      font-size: 0.875rem;
      line-height: 1.6;
      color: #e4e4e7;
      outline: none;
      transition: border-color 0.2s ease;
    }

    .cp-source::placeholder {
      color: #3f3f46;
    }

    .cp-source:focus {
      border-color: rgba(222, 179, 235, 0.3);
    }

    /* ── Inline copy icon button ── */
    .cp-copy-btn {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      width: 28px;
      height: 28px;
      border-radius: 6px;
      border: 1px solid #27272a;
      background: #0f0f11;
      color: #52525b;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition:
        color 0.2s ease,
        background 0.2s ease,
        border-color 0.2s ease;
    }

    .cp-copy-btn:hover:not(:disabled) {
      color: #e4e4e7;
      background: #1a1a1d;
      border-color: #3f3f46;
    }

    .cp-copy-btn--copied {
      color: #22c55e;
      border-color: rgba(34, 197, 94, 0.25);
      background: rgba(34, 197, 94, 0.08);
    }

    .cp-copy-btn:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }

    /* ── Divider ── */
    .cp-divider {
      height: 1px;
      background: #1a1a1d;
    }

    /* ── Clipboard read section ── */
    .cp-clipboard {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .cp-clipboard-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .cp-label {
      font-size: 0.6875rem;
      font-weight: 500;
      color: #52525b;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    .cp-clipboard-body {
      font-size: 0.875rem;
      line-height: 1.6;
      color: #a1a1aa;
      min-height: 1.4rem;
      word-break: break-all;
    }

    .cp-empty {
      color: #3f3f46;
      font-style: italic;
    }
  `,
})
export class ClipboardDemo {
  readonly cb = clipboard();

  readonly importCode = `import { clipboard } from '@signality/core'`;

  text = 'Hello, Signality!';

  async copy(): Promise<void> {
    await this.cb.copy(this.text);
  }

  async paste(): Promise<void> {
    await this.cb.paste();
  }
}

import { ChangeDetectionStrategy, Component, effect, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { broadcastChannel } from '@signality/core';
import { DemoCard, DemoInput, Wrapper } from '../../common';

interface Message {
  text: string;
  time: Date;
}

@Component({
  selector: 'demo-broadcast-channel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard, DemoInput, FormsModule],
  template: `
    <ng-demo-wrapper [demoPath]="'broadcast-channel/broadcast-channel-demo'" [code]="importCode">
      <demo-card>
        <!-- Messages list -->
        <div class="bc-messages">
          @if (messages().length === 0) {
          <span class="bc-empty">No messages yet. Open another tab to test.</span>
          } @for (msg of messages(); track msg.time) {
          <div class="bc-msg">
            <span class="bc-msg-text">{{ msg.text }}</span>
            <span class="bc-msg-time">{{ msg.time.toLocaleTimeString() }}</span>
          </div>
          }
        </div>

        <!-- Divider -->
        <div class="bc-divider"></div>

        <!-- Send row -->
        <div class="bc-send">
          <input
            demoInput
            class="bc-input"
            placeholder="Type a message…"
            [(ngModel)]="messageText"
            [disabled]="channel.isClosed()"
            (keydown.enter)="sendMessage()"
          />
          <button
            title="Send"
            type="button"
            class="bc-send-icon"
            (click)="sendMessage()"
            [class.bc-send-icon--sent]="isSending()"
            [disabled]="channel.isClosed()"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M22 2 11 13" />
              <path d="M22 2 15 22 11 13 2 9l20-7z" />
            </svg>
          </button>
        </div>

        <!-- Divider -->
        <div class="bc-divider"></div>

        <!-- Footer: channel status + close -->
        <div class="bc-footer">
          <span class="bc-status" [class.bc-status--closed]="channel.isClosed()">
            <span class="bc-dot" [class.bc-dot--closed]="channel.isClosed()"></span>
            {{ channel.isClosed() ? 'Closed' : 'demo-channel' }}
          </span>

          @if (!channel.isClosed()) {
          <button class="bc-btn bc-btn--close" (click)="channel.close()">Close</button>
          }
        </div>
      </demo-card>
    </ng-demo-wrapper>
  `,
  styles: `
    /* ── Messages area ── */
    .bc-messages {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
      min-height: 4rem;
      max-height: 11rem;
      overflow-y: auto;
      padding-bottom: 0.25rem;
    }

    .bc-empty {
      font-size: 0.845rem;
      color: #52525b;
    }

    .bc-msg {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 0.75rem;
      padding: 0.4375rem 0.625rem;
      background: #161618;
      border-radius: 6px;
    }

    .bc-msg-text {
      font-size: 0.875rem;
      color: #e4e4e7;
      word-break: break-word;
      min-width: 0;
    }

    .bc-msg-time {
      font-size: 0.75rem;
      color: #52525b;
      flex-shrink: 0;
    }

    /* ── Divider ── */
    .bc-divider {
      height: 1px;
      background: #1f1f22;
      margin: 0.875rem 0 0;
    }

    /* ── Send row ── */
    .bc-send {
      position: relative;
      padding-top: 0.75rem;
    }

    .bc-input {
      width: 100%;
      padding-right: 2.75rem !important;
    }

    /* ── Footer ── */
    .bc-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 0.75rem;
    }

    .bc-status {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      font-size: 0.8125rem;
      color: #71717a;
      margin-inline-start: 0.25rem;
    }

    .bc-status--closed {
      color: #52525b;
    }

    /* ── Status dot ── */
    .bc-dot {
      position: relative;
      width: 6px;
      height: 6px;
      flex-shrink: 0;
    }

    .bc-dot::before,
    .bc-dot::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: #22c55e;
    }

    .bc-dot::after {
      animation: bcPulse 2s ease-out infinite;
    }

    .bc-dot--closed::before,
    .bc-dot--closed::after {
      background: #3f3f46;
      animation: none;
    }

    @keyframes bcPulse {
      0%   { transform: scale(1); opacity: 0.6; }
      100% { transform: scale(3); opacity: 0; }
    }

    /* ── Buttons ── */
    .bc-btn {
      font-size: 0.8125rem;
      font-family: inherit;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
      transition: color 0.15s ease, opacity 0.15s ease;
    }

    .bc-btn:disabled {
      opacity: 0.35;
      cursor: default;
    }

    .bc-send-icon {
      position: absolute;
      right: 4px;
      top: calc(0.75rem + 4px);
      bottom: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      inline-size: 34px;
      border-radius: 4px;
      background: none;
      border: none;
      cursor: pointer;
      color: #DEB3EB;
      transition: color 0.15s ease, opacity 0.15s ease;
      padding: 0;
    }

    .bc-send-icon:not(:disabled):hover {
      color: #e8c8f5;
      background: rgba(222, 179, 235, 0.06);
    }

    .bc-send-icon:disabled {
      opacity: 0.3;
      cursor: default;
    }

    .bc-send-icon svg {
      transition: transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) 0.28s,
                  opacity 0.35s cubic-bezier(0.33, 1, 0.68, 1) 0.28s;
    }

    .bc-send-icon--sent svg {
      transform: translate(14px, -14px) scale(0.35) rotate(45deg);
      opacity: 0;
      transition: transform 0.28s cubic-bezier(0.4, 0, 1, 1),
                  opacity 0.28s cubic-bezier(0.4, 0, 1, 1);
    }

    .bc-btn--close {
      color: #52525b;
    }

    .bc-btn--close:hover {
      color: #a1a1aa;
    }
  `,
})
export class BroadcastChannelDemo {
  readonly channel = broadcastChannel<Message>('demo-channel');
  readonly importCode = `import { broadcastChannel } from '@signality/core'`;

  readonly messageText = signal('');
  readonly messages = signal<Message[]>([]);
  readonly isSending = signal(false);

  constructor() {
    effect(() => {
      const data = this.channel.data();
      if (data) {
        this.messages.update(msgs => [...msgs, { text: data.text, time: new Date(data.time) }]);
      }
    });
  }

  sendMessage(): void {
    const text = this.messageText().trim();

    if (text && !this.channel.isClosed()) {
      this.channel.post({ text, time: new Date() });
      this.messageText.set('');
      this.isSending.set(true);
      setTimeout(() => this.isSending.set(false), 350);
    }
  }
}

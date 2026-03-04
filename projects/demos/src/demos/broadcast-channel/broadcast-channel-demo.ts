import {
  ChangeDetectionStrategy,
  Component,
  effect,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { broadcastChannel } from '@signality/core/browser/broadcast-channel';
import { DemoButton, DemoCard, DemoInput, Wrapper } from '../../common';

interface Message {
  text: string;
  time: Date;
}

@Component({
  selector: 'demo-broadcast-channel',
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoButton, DemoCard, DemoInput, FormsModule],
  template: `
    <ng-demo-wrapper [code]="importCode">
      <div class="channel-card">
        <div class="send-row">
          <demo-input
            class="input-flex"
            placeholder="Enter message..."
            [(ngModel)]="messageText"
            (keydown.enter)="sendMessage()"
          />
          <demo-button variant="primary" (click)="sendMessage()" [disabled]="channel.isClosed()">
            Send
          </demo-button>
        </div>

        <demo-card>
          <div class="messages-section">
            <div class="messages-header">
              <span class="messages-label">Messages</span>
              @if (messages().length > 0) {
              <span class="messages-count">{{ messages().length }}</span>
              }
            </div>
            <div class="messages-list">
              @if (messages().length === 0) {
              <span class="messages-empty">No messages yet. Open another tab to test.</span>
              } @for (msg of messages(); track msg.time) {
              <div class="message-item">
                <span class="message-text">{{ msg.text }}</span>
                <span class="message-time">{{ msg.time.toLocaleTimeString() }}</span>
              </div>
              }
            </div>
          </div>
        </demo-card>
      </div>
    </ng-demo-wrapper>
  `,
  styles: `
    .channel-card {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .send-row {
      display: flex;
      gap: 0.75rem;
    }

    .input-flex {
      flex: 1;
    }

    .messages-section {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .messages-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .messages-label {
      font-size: 0.75rem;
      font-weight: 500;
      color: #a1a1aa;
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }

    .messages-count {
      font-size: 0.75rem;
      color: #a1a1aa;
      background: #232125;
      padding: 0.125rem 0.5rem;
      border-radius: 999px;
    }

    .messages-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      min-height: 3rem;
      max-height: 12rem;
      overflow-y: auto;
    }

    .messages-empty {
      color: #71717a;
      font-style: italic;
      font-size: 0.875rem;
    }

    .message-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #161618;
      padding: 0.5rem 0.75rem;
      border-radius: 6px;
    }

    .message-text {
      font-size: 0.875rem;
      color: #e4e4e7;
      word-break: break-all;
    }

    .message-time {
      font-size: 0.75rem;
      color: #71717a;
      flex-shrink: 0;
      margin-left: 0.5rem;
    }
  `,
})
export class BroadcastChannelDemo {
  readonly channel = broadcastChannel<Message>('demo-channel');
  readonly importCode = `import { broadcastChannel } from '@signality/core'`;

  messageText = '';
  readonly messages = signal<Message[]>([]);

  constructor() {
    effect(() => {
      const data = this.channel.data();

      if (data) {
        this.messages.update(msgs => [...msgs, { text: data.text, time: data.time }]);
      }
    });
  }

  sendMessage(): void {
    if (this.messageText.trim()) {
      this.channel.post({ text: this.messageText.trim(), time: new Date() });
      this.messageText = '';
    }
  }
}

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
  templateUrl: './broadcast-channel-demo.html',
  styleUrl: './broadcast-channel-demo.scss',
})
export class BroadcastChannelDemo {
  readonly importCode = `import { broadcastChannel } from '@signality/core'`;

  readonly channel = broadcastChannel<Message>('demo-channel');

  readonly messageText = signal('');
  readonly messages = signal<Message[]>([]);
  readonly isSending = signal(false);
  readonly hasSent = signal(false);

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
      this.hasSent.set(true);
      setTimeout(() => this.isSending.set(false), 350);
    }
  }
}

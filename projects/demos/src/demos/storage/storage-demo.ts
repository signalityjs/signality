import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { storage } from '@signality/core';
import { DemoCard, DemoInput, DemoToggle, Wrapper } from '../../common';

@Component({
  selector: 'demo-storage',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard, DemoInput, DemoToggle, FormsModule],
  templateUrl: './storage-demo.html',
  styleUrl: './storage-demo.scss',
})
export class StorageDemo {
  readonly importCode = `import { storage } from '@signality/core'`;

  readonly storageType = storage<'local' | 'session'>('demo-storage-type', 'local');
  readonly message = storage<string>('demo-storage-message', '', { type: this.storageType() });

  readonly storageOptions = [
    { label: 'local', value: 'local' as const },
    { label: 'session', value: 'session' as const },
  ];

  get messageText(): string {
    return this.message();
  }

  set messageText(value: string) {
    this.message.set(value);
  }

  clear(): void {
    this.message.set('');
  }
}

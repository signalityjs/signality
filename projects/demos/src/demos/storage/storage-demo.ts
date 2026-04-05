import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
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
  readonly localMessage = storage('demo-local-storage-message', '', { type: 'local' });
  readonly sessionMessage = storage('demo-session-storage-message', '', { type: 'session' });

  readonly storageOptions = [
    { label: 'local', value: 'local' as const },
    { label: 'session', value: 'session' as const },
  ];

  readonly storageUrl = computed(() =>
    this.storageType() === 'local'
      ? 'https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage'
      : 'https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage'
  );

  clear(): void {
    this.localMessage.set('');
    this.sessionMessage.set('');
  }
}

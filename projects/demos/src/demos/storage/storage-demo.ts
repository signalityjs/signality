import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { storage } from '@signality/core/browser/storage';
import { DemoButton, DemoCard, DemoInput, DemoToggle, Wrapper } from '../../common';

@Component({
  selector: 'demo-storage',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoButton, DemoCard, DemoInput, DemoToggle, FormsModule],
  template: `
    <ng-demo-wrapper [code]="importCode">
      <div class="storage-card">
        <demo-card>
          <div class="storage-row">
            <span class="storage-label">Type</span>
            <demo-toggle [options]="storageOptions" [value]="storageType" />
          </div>
        </demo-card>

        <demo-card>
          <div class="storage-row">
            <span class="storage-label">Counter</span>
            <div class="counter-controls">
              <button class="counter-btn" (click)="count.set(count() - 1)">−</button>
              <span class="counter-value">{{ count() }}</span>
              <button class="counter-btn" (click)="count.set(count() + 1)">+</button>
            </div>
          </div>
        </demo-card>

        <demo-card>
          <div class="storage-row">
            <span class="storage-label">Message</span>
            <demo-input
              class="message-input"
              placeholder="Type a message..."
              [(ngModel)]="messageText"
            />
          </div>
          <div class="storage-hint">Value: "{{ messageText }}"</div>
        </demo-card>

        <div class="actions">
          <demo-button variant="ghost" size="sm" (click)="clear()">Clear All</demo-button>
        </div>
      </div>
    </ng-demo-wrapper>
  `,
  styles: `
    .storage-card {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .storage-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }

    .storage-label {
      font-size: 0.875rem;
      font-weight: 500;
      color: #a1a1aa;
    }

    .counter-controls {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .counter-btn {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      font-weight: 500;
      color: #e4e4e7;
      background: #27272a;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      transition: background 0.15s ease;
    }

    .counter-btn:hover {
      background: #3f3f46;
    }

    .counter-value {
      font-size: 1.25rem;
      font-weight: 600;
      color: #e4e4e7;
      min-width: 2.5rem;
      text-align: center;
    }

    .message-input {
      flex: 1;
      max-width: 200px;
    }

    .storage-hint {
      font-size: 0.75rem;
      color: #71717a;
      margin-top: 0.5rem;
    }

    .actions {
      display: flex;
      justify-content: flex-end;
    }
  `,
})
export class StorageDemo {
  readonly storageType = storage<'local' | 'session'>('demo-storage-type', 'local');
  readonly count = storage<number>('demo-storage-count', 0, { type: this.storageType() });
  readonly message = storage<string>('demo-storage-message', '', { type: this.storageType() });

  readonly storageOptions = [
    { label: 'local', value: 'local' as const },
    { label: 'session', value: 'session' as const },
  ];

  readonly importCode = `import { storage } from '@signality/core'`;

  get messageText(): string {
    return this.message();
  }

  set messageText(value: string) {
    this.message.set(value);
  }

  clear(): void {
    this.count.set(0);
    this.message.set('');
  }
}

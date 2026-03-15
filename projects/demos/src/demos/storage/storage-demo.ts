import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { storage } from '@signality/core/browser/storage';
import { DemoCard, DemoInput, DemoToggle, Wrapper } from '../../common';

@Component({
  selector: 'demo-storage',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard, DemoInput, DemoToggle, FormsModule],
  template: `
    <ng-demo-wrapper [demoPath]="'storage/storage-demo'" [code]="importCode">
      <demo-card>
        <!-- Toggle + Input -->
        <div class="st-input-row">
          <demo-toggle [options]="storageOptions" [value]="storageType" />
          <input
            demoInput
            class="st-input"
            size="sm"
            placeholder="Type something to persist..."
            [(ngModel)]="messageText"
          />
        </div>

        <div class="st-divider"></div>

        <!-- Footer -->
        <div class="st-footer">
          <span class="st-status">
            <svg
              class="st-sync-icon"
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
              <path d="M16 16h5v5" />
            </svg>
            Synced to {{ storageType() }}Storage
          </span>
          <button class="st-clear" (click)="clear()">Clear</button>
        </div>
      </demo-card>
    </ng-demo-wrapper>
  `,
  styles: `
    /* ── Toggle + Input row ── */
    .st-input-row {
      display: flex;
      align-items: center;
      gap: 0.625rem;
    }

    .st-input {
      flex: 1;
    }

    /* ── Divider ── */
    .st-divider {
      height: 1px;
      background: #1f1f22;
      margin: 0.875rem 0 0;
    }

    /* ── Footer ── */
    .st-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 0.75rem;
    }

    .st-status {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      font-size: 0.8125rem;
      color: #71717a;
    }

    @keyframes stSyncSpin {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }

    .st-sync-icon {
      flex-shrink: 0;
      animation: stSyncSpin 4s linear infinite;
    }

    .st-clear {
      font-size: 0.8125rem;
      font-family: inherit;
      color: #52525b;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
      transition: color 0.15s ease;
    }

    .st-clear:hover {
      color: #a1a1aa;
    }
  `,
})
export class StorageDemo {
  readonly storageType = storage<'local' | 'session'>('demo-storage-type', 'local');
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
    this.message.set('');
  }
}

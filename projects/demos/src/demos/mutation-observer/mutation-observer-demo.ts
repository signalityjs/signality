import { ChangeDetectionStrategy, Component, ElementRef, signal, viewChild } from '@angular/core';
import { mutationObserver } from '@signality/core/observers/mutation-observer';
import { DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-mutation-observer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard],
  template: `
    <ng-demo-wrapper [demoPath]="'mutation-observer/mutation-observer-demo'" [code]="importCode">
      <demo-card>
        <!-- Observed container -->
        <div #container class="mo-list">
          @if (items().length === 0) {
          <span class="mo-empty">No items</span>
          } @for (item of items(); track item) {
          <div class="mo-item">Item {{ item }}</div>
          }
        </div>

        <!-- Divider -->
        <div class="mo-divider"></div>

        <!-- Info rows -->
        <div class="mo-rows">
          <div class="mo-row">
            <span class="mo-label">Children</span>
            <span class="mo-value">{{ items().length }}</span>
          </div>
          <div class="mo-row">
            <span class="mo-label">Mutations</span>
            <span class="mo-value">{{ mutationCount() }}</span>
          </div>
        </div>

        <!-- Divider -->
        <div class="mo-divider"></div>

        <!-- Footer actions -->
        <div class="mo-footer">
          <button
            class="mo-btn mo-btn--muted"
            (click)="clearAll()"
            [disabled]="items().length === 0"
          >
            Clear
          </button>
          <div class="mo-actions">
            <button
              class="mo-btn mo-btn--secondary"
              (click)="removeItem()"
              [disabled]="items().length === 0"
            >
              Remove
            </button>
            <button class="mo-btn mo-btn--accent" (click)="addItem()">Add Item</button>
          </div>
        </div>
      </demo-card>
    </ng-demo-wrapper>
  `,
  styles: `
    /* ── List ── */
    .mo-list {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
      min-height: 4.5rem;
      max-height: 9rem;
      overflow-y: auto;
    }

    .mo-empty {
      font-size: 0.8125rem;
      color: #52525b;
      font-style: italic;
    }

    .mo-item {
      padding: 0.375rem 0.625rem;
      background: #161618;
      border-radius: 5px;
      font-size: 0.8125rem;
      color: #a1a1aa;
    }

    /* ── Divider ── */
    .mo-divider {
      height: 1px;
      background: #1f1f22;
      margin: 0.875rem 0 0;
    }

    /* ── Info rows ── */
    .mo-rows {
      display: flex;
      flex-direction: column;
      padding-top: 0.75rem;
    }

    .mo-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.3125rem 0;
    }

    .mo-row + .mo-row {
      border-top: 1px solid #1f1f22;
    }

    .mo-label {
      font-size: 0.8125rem;
      color: #71717a;
    }

    .mo-value {
      font-size: 0.8125rem;
      color: #a1a1aa;
      font-variant-numeric: tabular-nums;
    }

    /* ── Footer ── */
    .mo-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 0.75rem;
    }

    .mo-actions {
      display: flex;
      gap: 0.75rem;
      align-items: center;
    }

    /* ── Buttons ── */
    .mo-btn {
      font-size: 0.8125rem;
      font-family: inherit;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
      transition: color 0.15s ease, opacity 0.15s ease;
    }

    .mo-btn:disabled {
      opacity: 0.3;
      cursor: default;
    }

    .mo-btn--muted {
      color: #52525b;
    }

    .mo-btn--muted:not(:disabled):hover {
      color: #a1a1aa;
    }

    .mo-btn--secondary {
      color: #71717a;
    }

    .mo-btn--secondary:not(:disabled):hover {
      color: #a1a1aa;
    }

    .mo-btn--accent {
      color: #DEB3EB;
    }

    .mo-btn--accent:not(:disabled):hover {
      color: #e8c8f5;
    }
  `,
})
export class MutationObserverDemo {
  readonly container = viewChild<ElementRef>('container');
  readonly items = signal<number[]>([1, 2, 3]);
  readonly mutationCount = signal(0);

  readonly importCode = `import { mutationObserver } from '@signality/core'`;

  private counter = 3;

  constructor() {
    mutationObserver(
      this.container,
      mutations => {
        this.mutationCount.update(c => c + mutations.length);
      },
      { childList: true }
    );
  }

  addItem(): void {
    this.counter++;
    this.items.update(items => [...items, this.counter]);
  }

  removeItem(): void {
    this.items.update(items => items.slice(0, -1));
  }

  clearAll(): void {
    this.items.set([]);
  }
}

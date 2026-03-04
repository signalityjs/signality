import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  signal,
  viewChild,
  ElementRef,
} from '@angular/core';
import { mutationObserver } from '@signality/core/observers/mutation-observer';
import { DemoButton, DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-mutation-observer',
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard, DemoButton],
  template: `
    <ng-demo-wrapper [code]="importCode">
      <div class="mutation-card">
        <div #container class="mutation-container">
          @for (item of items(); track item) {
          <div class="item">{{ item }}</div>
          }
        </div>

        <demo-card>
          <div class="mutation-info">
            <div class="info-row">
              <span class="info-label">Children Count</span>
              <span class="info-value">{{ items().length }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Total Mutations</span>
              <span class="info-value">{{ mutationCount() }}</span>
            </div>
          </div>
        </demo-card>

        <div class="button-row">
          <demo-button variant="secondary" size="sm" (click)="addItem()"> Add Item </demo-button>
          <demo-button variant="secondary" size="sm" (click)="removeItem()">
            Remove Item
          </demo-button>
          <demo-button variant="ghost" size="sm" (click)="clearAll()"> Clear </demo-button>
        </div>
      </div>
    </ng-demo-wrapper>
  `,
  styles: `
    .mutation-card {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .mutation-container {
      background: #161618;
      border: 1px solid #3f3f46;
      border-radius: 8px;
      padding: 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .item {
      background: #232125;
      padding: 0.5rem 0.75rem;
      border-radius: 4px;
      font-size: 0.875rem;
      color: #e4e4e7;
    }

    .mutation-info {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .info-label {
      font-size: 0.75rem;
      font-weight: 500;
      color: #a1a1aa;
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }

    .info-value {
      font-size: 0.875rem;
      font-weight: 500;
      color: #e4e4e7;
      font-family: 'SF Mono', Monaco, 'Courier New', monospace;
    }

    .button-row {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
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

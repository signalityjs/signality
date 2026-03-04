import { ChangeDetectionStrategy, Component, ElementRef, signal, viewChild } from '@angular/core';
import { onClickOutside } from '@signality/core/elements/on-click-outside';
import { DemoBadge, DemoButton, DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-on-click-outside',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard, DemoButton, DemoBadge],
  template: `
    <ng-demo-wrapper [code]="importCode">
      <div class="click-demo">
        <div #dropdown class="dropdown" [class.open]="isOpen()">
          <span class="dropdown-text">Dropdown content</span>
        </div>

        <demo-card>
          <div class="status-row">
            <span class="status-label">Click outside</span>
            <demo-badge [type]="clickedOutside() ? 'warning' : 'neutral'">
              {{ clickedOutside() ? 'Detected!' : 'Not detected' }}
            </demo-badge>
          </div>
        </demo-card>

        <demo-button #trigger variant="secondary" (click)="toggle()">
          {{ isOpen() ? 'Close' : 'Open' }} Dropdown
        </demo-button>
      </div>
    </ng-demo-wrapper>
  `,
  styles: `
    .click-demo {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .dropdown {
      padding: 1rem;
      background: #161618;
      border: 1px dashed #3f3f46;
      border-radius: 8px;
      text-align: center;
      transition: all 0.2s ease;
    }

    .dropdown.open {
      border-color: #DEB3EB;
      background: rgba(222, 179, 235, 0.1);
    }

    .dropdown-text {
      font-size: 0.875rem;
      color: #a1a1aa;
    }

    .dropdown.open .dropdown-text {
      color: #DEB3EB;
    }

    .status-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .status-label {
      font-size: 0.875rem;
      font-weight: 500;
      color: #a1a1aa;
    }
  `,
})
export class OnClickOutsideDemo {
  readonly dropdown = viewChild<ElementRef>('dropdown');
  readonly btn = viewChild<ElementRef>('trigger');
  readonly isOpen = signal(false);
  readonly clickedOutside = signal(false);

  readonly importCode = `import { onClickOutside } from '@signality/core'`;

  constructor() {
    onClickOutside(
      this.dropdown,
      () => {
        if (this.isOpen()) {
          this.clickedOutside.set(true);
          this.isOpen.set(false);
          setTimeout(() => this.clickedOutside.set(false), 2000);
        }
      },
      { ignore: [this.btn] }
    );
  }

  toggle(): void {
    this.isOpen.update(v => !v);
  }
}

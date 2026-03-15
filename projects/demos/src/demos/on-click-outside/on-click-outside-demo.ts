import { ChangeDetectionStrategy, Component, ElementRef, signal, viewChild } from '@angular/core';
import { onClickOutside } from '@signality/core/elements/on-click-outside';
import { DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-on-click-outside',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard],
  template: `
    <ng-demo-wrapper [demoPath]="'on-click-outside/on-click-outside-demo'" [code]="importCode">
      <demo-card>
        <!-- Dropdown zone -->
        <div
          #dropdown
          class="co-zone"
          [class.co-zone--open]="isOpen()"
          [class.co-zone--dismissed]="clickedOutside()"
        >
          {{
            clickedOutside() ? 'Dismissed' : isOpen() ? 'Click outside to close' : 'Open the panel'
          }}
        </div>

        <!-- Divider -->
        <div class="co-divider"></div>

        <!-- Footer -->
        <div class="co-footer">
          <span
            class="co-status"
            [class.co-status--open]="isOpen()"
            [class.co-status--dismissed]="clickedOutside()"
          >
            <span
              class="co-dot"
              [class.co-dot--open]="isOpen() && !clickedOutside()"
              [class.co-dot--dismissed]="clickedOutside()"
            ></span>
            {{ clickedOutside() ? 'Click outside detected' : isOpen() ? 'Open' : 'Closed' }}
          </span>
          <button #trigger class="co-btn" (click)="toggle()">
            {{ isOpen() ? 'Close' : 'Open' }}
          </button>
        </div>
      </demo-card>
    </ng-demo-wrapper>
  `,
  styles: `
    /* ── Dropdown zone ── */
    .co-zone {
      height: 80px;
      border: 1px dashed #27272a;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8125rem;
      color: #52525b;
      transition: border-color 0.2s ease, background 0.2s ease, color 0.2s ease;
      user-select: none;
    }

    .co-zone--open {
      border-color: rgba(222, 179, 235, 0.35);
      background: rgba(222, 179, 235, 0.04);
      color: #DEB3EB;
    }

    .co-zone--dismissed {
      border-color: rgba(245, 158, 11, 0.35);
      background: rgba(245, 158, 11, 0.04);
      color: #f59e0b;
    }

    /* ── Divider ── */
    .co-divider {
      height: 1px;
      background: #1f1f22;
      margin: 0.875rem 0 0;
    }

    /* ── Footer ── */
    .co-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 0.75rem;
    }

    .co-status {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8125rem;
      color: #52525b;
      transition: color 0.2s ease;
    }

    .co-status--open      { color: #a1a1aa; }
    .co-status--dismissed { color: #a1a1aa; }

    /* ── Status dot ── */
    .co-dot {
      position: relative;
      width: 6px;
      height: 6px;
      flex-shrink: 0;
    }

    .co-dot::before,
    .co-dot::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: #3f3f46;
      transition: background 0.2s ease;
    }

    .co-dot--open::before,
    .co-dot--open::after { background: #DEB3EB; }

    .co-dot--open::after {
      animation: coPulse 2s ease-out infinite;
    }

    .co-dot--dismissed::before,
    .co-dot--dismissed::after { background: #f59e0b; }

    .co-dot--dismissed::after {
      animation: coPulse 1.2s ease-out infinite;
    }

    @keyframes coPulse {
      0%   { transform: scale(1); opacity: 0.6; }
      100% { transform: scale(3); opacity: 0; }
    }

    /* ── Button ── */
    .co-btn {
      font-size: 0.8125rem;
      font-family: inherit;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
      color: #DEB3EB;
      transition: color 0.15s ease;
    }

    .co-btn:hover { color: #e8c8f5; }
  `,
})
export class OnClickOutsideDemo {
  readonly dropdown = viewChild<ElementRef>('dropdown');
  readonly btn = viewChild('trigger', { read: ElementRef });
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
          setTimeout(() => this.clickedOutside.set(false), 1500);
        }
      },
      { ignore: [this.btn] }
    );
  }

  toggle(): void {
    this.isOpen.update(v => !v);
  }
}

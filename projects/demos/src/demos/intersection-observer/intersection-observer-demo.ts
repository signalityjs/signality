import { ChangeDetectionStrategy, Component, ElementRef, signal, viewChild } from '@angular/core';
import { intersectionObserver } from '@signality/core/observers/intersection-observer';
import { DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-intersection-observer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard],
  template: `
    <ng-demo-wrapper
      [demoPath]="'intersection-observer/intersection-observer-demo'"
      [code]="importCode"
    >
      <demo-card>
        <!-- Scroll container with target box -->
        <div class="io-scroll">
          <div class="io-spacer">
            Scroll down
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <polyline points="19 12 12 19 5 12" />
            </svg>
          </div>
          <div #targetBox class="io-target" [class.io-target--visible]="isIntersecting()">
            {{ isIntersecting() ? 'Visible' : 'Hidden' }}
          </div>
          <div class="io-spacer io-spacer--bottom"></div>
        </div>

        <!-- Divider -->
        <div class="io-divider"></div>

        <!-- Footer -->
        <div class="io-footer">
          <span class="io-status" [class.io-status--active]="isIntersecting()">
            <span class="io-dot" [class.io-dot--active]="isIntersecting()"></span>
            {{ isIntersecting() ? 'Intersecting' : 'Not intersecting' }}
          </span>
          <button class="io-btn" (click)="scrollToBox()">Scroll to target</button>
        </div>
      </demo-card>
    </ng-demo-wrapper>
  `,
  styles: `
    /* ── Scroll area ── */
    .io-scroll {
      height: 120px;
      overflow-y: auto;
      border: 1px dashed #27272a;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      scrollbar-width: thin;
      scrollbar-color: #27272a transparent;
    }

    .io-spacer {
      flex-shrink: 0;
      height: 80px;
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.75rem;
      color: #3f3f46;
      user-select: none;
    }

    .io-spacer--bottom {
      height: 220px;
    }

    /* ── Target box ── */
    .io-target {
      flex-shrink: 0;
      width: calc(100% - 2rem);
      height: 48px;
      border-radius: 6px;
      border: 1px dashed #3f3f46;
      background: #161618;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8125rem;
      color: #52525b;
      transition: border-color 0.3s ease, background 0.3s ease, color 0.3s ease;
    }

    .io-target--visible {
      border-color: rgba(34, 197, 94, 0.4);
      background: rgba(34, 197, 94, 0.06);
      color: #22c55e;
    }

    /* ── Divider ── */
    .io-divider {
      height: 1px;
      background: #1f1f22;
      margin: 0.875rem 0 0;
    }

    /* ── Footer ── */
    .io-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 0.75rem;
    }

    .io-status {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8125rem;
      color: #52525b;
      transition: color 0.3s ease;
    }

    .io-status--active {
      color: #a1a1aa;
    }

    /* ── Status dot ── */
    .io-dot {
      position: relative;
      width: 6px;
      height: 6px;
      flex-shrink: 0;
    }

    .io-dot::before,
    .io-dot::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: #3f3f46;
      transition: background 0.3s ease;
    }

    .io-dot--active::before,
    .io-dot--active::after {
      background: #22c55e;
    }

    .io-dot--active::after {
      animation: ioPulse 2s ease-out infinite;
    }

    @keyframes ioPulse {
      0%   { transform: scale(1); opacity: 0.6; }
      100% { transform: scale(3); opacity: 0; }
    }

    /* ── Button ── */
    .io-btn {
      font-size: 0.8125rem;
      font-family: inherit;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
      color: #DEB3EB;
      transition: color 0.15s ease;
    }

    .io-btn:hover {
      color: #e8c8f5;
    }
  `,
})
export class IntersectionObserverDemo {
  readonly box = viewChild<ElementRef>('targetBox');
  readonly isIntersecting = signal(false);

  readonly importCode = `import { intersectionObserver } from '@signality/core'`;

  constructor() {
    intersectionObserver(
      this.box,
      entries => {
        this.isIntersecting.set(entries[0].isIntersecting);
      },
      { threshold: 0.1 }
    );
  }

  scrollToBox(): void {
    this.box()?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

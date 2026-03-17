import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { webWorker } from '@signality/core/browser/web-worker';
import { DemoCard, DemoToggle, Wrapper } from '../../common';

@Component({
  selector: 'demo-web-worker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard, DemoToggle],
  template: `
    <ng-demo-wrapper [demoPath]="'web-worker/web-worker-demo'" [code]="importCode">
      <demo-card>
        <!-- Result display -->
        <div class="ww-result">
          <span
            class="ww-value"
            [class.ww-value--set]="isComputed()"
            [class.ww-value--dim]="pending()"
          >
            {{ result() }}
          </span>
          <span class="ww-meta">fib({{ selected() }})</span>
        </div>

        <!-- Preset selector -->
        <div class="ww-presets">
          <demo-toggle [options]="toggleOptions" [value]="selected" [disabled]="pending()" />
        </div>

        <!-- Divider + footer -->
        <div class="ww-divider"></div>
        <div class="ww-footer">
          <span class="ww-status" [class.ww-status--active]="pending() || isComputed()">
            <span
              class="ww-dot"
              [class.ww-dot--computing]="pending()"
              [class.ww-dot--done]="isComputed() && !pending()"
              [class.ww-dot--error]="hasError()"
            ></span>
            {{ statusText() }}
          </span>
          <button class="ww-btn" [disabled]="!canCalculate()" (click)="calculate()">
            Calculate
          </button>
        </div>
      </demo-card>
    </ng-demo-wrapper>
  `,
  styles: `
    /* ── Result display ── */
    .ww-result {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
      padding: 0.5rem 0 1rem;
    }

    .ww-value {
      font-size: 2.5rem;
      font-weight: 700;
      letter-spacing: -0.03em;
      color: #3f3f46;
      line-height: 1;
      font-variant-numeric: tabular-nums;
      transition: color 0.3s ease, opacity 0.2s ease;
    }

    .ww-value--set {
      color: #e4e4e7;
    }

    .ww-value--dim {
      opacity: 0.3;
    }

    .ww-meta {
      font-size: 0.75rem;
      font-family: 'SF Mono', 'Fira Code', 'Roboto Mono', monospace;
      color: #52525b;
      transition: color 0.3s ease;
    }

    /* ── Preset selector ── */
    .ww-presets {
      display: flex;
      justify-content: center;
      padding-bottom: 0.125rem;
    }

    /* ── Divider ── */
    .ww-divider {
      height: 1px;
      background: #1f1f22;
      margin: 0.875rem 0 0;
    }

    /* ── Footer ── */
    .ww-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 0.75rem;
    }

    .ww-status {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8125rem;
      color: #71717a;
      transition: color 0.3s ease;
    }

    .ww-status--active {
      color: #a1a1aa;
    }

    .ww-dot {
      position: relative;
      width: 6px;
      height: 6px;
      flex-shrink: 0;
    }

    .ww-dot::before,
    .ww-dot::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: #3f3f46;
      transition: background 0.3s ease;
    }

    .ww-dot--done::before,
    .ww-dot--done::after {
      background: #22c55e;
    }

    .ww-dot--computing::before,
    .ww-dot--computing::after {
      background: #DEB3EB;
    }

    .ww-dot--computing::after {
      animation: wwPulse 1.2s ease-out infinite;
    }

    .ww-dot--error::before,
    .ww-dot--error::after {
      background: #ef4444;
    }

    @keyframes wwPulse {
      0%   { transform: scale(1); opacity: 0.6; }
      100% { transform: scale(3); opacity: 0; }
    }

    .ww-btn {
      font-size: 0.8125rem;
      font-family: inherit;
      color: #DEB3EB;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
      transition: color 0.15s ease;
    }

    .ww-btn:hover:not(:disabled) {
      color: #e8c8f5;
    }

    .ww-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  `,
})
export class WebWorkerDemo {
  readonly toggleOptions = [
    { label: '35', value: 35 as const },
    { label: '40', value: 40 as const },
    { label: '42', value: 42 as const },
  ];
  readonly selected = signal<35 | 40 | 42>(40);
  readonly pending = signal(false);

  private readonly _worker: ReturnType<typeof webWorker<number, number>> | null;

  readonly result = computed(() => {
    const d = this._worker?.data();
    return d !== undefined ? d.toLocaleString() : '—';
  });

  readonly isComputed = computed(() => this._worker?.data() !== undefined);

  readonly hasError = computed(() => !!this._worker?.error());

  readonly statusText = computed(() => {
    if (this.hasError()) return 'Error';
    if (this.pending()) return 'Computing…';
    if (!this._worker?.isReady()) return 'Initializing';
    return this.isComputed() ? 'Done' : 'Ready';
  });

  readonly canCalculate = computed(() => !!this._worker?.isReady() && !this.pending());

  readonly importCode = `import { webWorker } from '@signality/core'`;

  constructor() {
    const platformId = inject(PLATFORM_ID);

    if (isPlatformBrowser(platformId)) {
      const blob = new Blob(
        [
          `self.onmessage=function(e){function f(n){return n<=1?n:f(n-1)+f(n-2)}self.postMessage(f(e.data))}`,
        ],
        { type: 'application/javascript' }
      );
      this._worker = webWorker<number, number>(URL.createObjectURL(blob));
    } else {
      this._worker = null;
    }

    effect(() => {
      this._worker?.data(); // track data changes → clear pending
      this.pending.set(false);
    });
  }

  calculate(): void {
    if (!this._worker || !this._worker.isReady()) return;
    this.pending.set(true);
    this._worker.post(this.selected());
  }
}

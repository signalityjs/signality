import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  signal,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { webWorker } from '@signality/core/browser/web-worker';
import { DemoButton, DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-web-worker',
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard, DemoButton],
  template: `
    <ng-demo-wrapper [code]="importCode">
      <div class="worker-card">
        <demo-card>
          <div class="worker-info">
            <div class="info-row">
              <span class="info-label">Status</span>
              <span
                class="info-value"
                [class.ready]="worker?.isReady()"
                [class.error]="worker?.error()"
              >
                @if (worker?.error()) { Error } @else if (worker?.isReady()) { Ready } @else {
                Initializing... }
              </span>
            </div>
            <div class="info-row">
              <span class="info-label">Last Result</span>
              <span class="info-value">{{ worker?.data() ?? '-' }}</span>
            </div>
          </div>
        </demo-card>

        <demo-button variant="primary" (click)="calculate()" [disabled]="!worker?.isReady()">
          Calculate Fibonacci (10)
        </demo-button>
      </div>
    </ng-demo-wrapper>
  `,
  styles: `
    .worker-card {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .worker-info {
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

    .info-value.ready {
      color: #22c55e;
    }

    .info-value.error {
      color: #ef4444;
    }
  `,
})
export class WebWorkerDemo {
  worker: ReturnType<typeof webWorker<number, number>> | null = null;

  readonly importCode = `import { webWorker } from '@signality/core'`;

  constructor() {
    const platformId = inject(PLATFORM_ID);

    if (isPlatformBrowser(platformId)) {
      const workerCode = `
        self.onmessage = function(e) {
          function fib(n) {
            if (n <= 1) return n;
            return fib(n - 1) + fib(n - 2);
          }
          const result = fib(e.data);
          self.postMessage(result);
        };
      `;
      const blob = new Blob([workerCode], { type: 'application/javascript' });
      const workerUrl = URL.createObjectURL(blob);

      this.worker = webWorker<number, number>(workerUrl);
    }
  }

  calculate(): void {
    if (this.worker) {
      this.worker.post(10);
    }
  }
}

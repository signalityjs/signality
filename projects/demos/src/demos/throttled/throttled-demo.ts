import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { throttled } from '@signality/core/reactivity/throttled';
import { DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-throttled',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard],
  template: `
    <ng-demo-wrapper [code]="importCode">
      <div class="throttled-card">
        <div class="move-area" (mousemove)="onMouseMove($event)">
          <span class="move-hint">Move your mouse here</span>
        </div>

        <demo-card>
          <div class="values-grid">
            <div class="value-item">
              <span class="value-label">Immediate</span>
              <span class="value-text">{{ immediateX() }}, {{ immediateY() }}</span>
            </div>
            <div class="value-item">
              <span class="value-label">Throttled (100ms)</span>
              <span class="value-text throttled">{{ throttledX() }}, {{ throttledY() }}</span>
            </div>
          </div>
        </demo-card>
      </div>
    </ng-demo-wrapper>
  `,
  styles: `
    .throttled-card {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .move-area {
      height: 120px;
      background: #161618;
      border: 1px dashed #3f3f46;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .move-hint {
      font-size: 0.875rem;
      color: #71717a;
    }

    .values-grid {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .value-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .value-label {
      font-size: 0.75rem;
      font-weight: 500;
      color: #a1a1aa;
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }

    .value-text {
      font-size: 0.875rem;
      font-weight: 500;
      color: #e4e4e7;
      font-family: 'SF Mono', Monaco, 'Courier New', monospace;
    }

    .value-text.throttled {
      color: #DEB3EB;
    }
  `,
})
export class ThrottledDemo {
  readonly immediateX = signal(0);
  readonly immediateY = signal(0);
  readonly throttledX = throttled(0, 100);
  readonly throttledY = throttled(0, 100);

  readonly importCode = `import { throttled } from '@signality/core'`;

  onMouseMove(event: MouseEvent): void {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    this.immediateX.set(Math.round(x));
    this.immediateY.set(Math.round(y));
    this.throttledX.set(Math.round(x));
    this.throttledY.set(Math.round(y));
  }
}

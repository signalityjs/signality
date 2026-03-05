import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { resizeObserver } from '@signality/core/observers/resize-observer';
import { DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-resize-observer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard],
  template: `
    <ng-demo-wrapper [code]="importCode">
      <div class="resize-demo">
        <div #resizable class="resizable-box">
          <span class="box-hint">Resize this box</span>
        </div>

        <demo-card>
          <div class="size-grid">
            <div class="size-item">
              <span class="size-label">Width</span>
              <span class="size-value">{{ size().width.toFixed(0) }}px</span>
            </div>
            <div class="size-item">
              <span class="size-label">Height</span>
              <span class="size-value">{{ size().height.toFixed(0) }}px</span>
            </div>
          </div>
        </demo-card>
      </div>
    </ng-demo-wrapper>
  `,
  styles: `
    .resize-demo {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .resizable-box {
      height: 80px;
      background: #161618;
      border: 1px dashed #3f3f46;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      resize: both;
      overflow: hidden;
      min-width: 100px;
      min-height: 60px;
    }

    .box-hint {
      font-size: 0.875rem;
      color: #71717a;
    }

    .size-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .size-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .size-label {
      font-size: 0.75rem;
      font-weight: 500;
      color: #a1a1aa;
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }

    .size-value {
      font-size: 1rem;
      font-weight: 600;
      color: #e4e4e7;
    }
  `,
})
export class ResizeObserverDemo {
  readonly resizable = viewChild<HTMLElement>('resizable');
  readonly size = signal({ width: 0, height: 0 });

  readonly importCode = `import { resizeObserver } from '@signality/core'`;

  constructor() {
    resizeObserver(this.resizable, entries => {
      const { width, height } = entries[0].contentRect;
      this.size.set({ width, height });
    });
  }
}

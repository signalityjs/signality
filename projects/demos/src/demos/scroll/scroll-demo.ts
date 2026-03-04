import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { scroll } from '@signality/core/elements/scroll';
import { DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-scroll',
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard],
  template: `
    <ng-demo-wrapper [code]="importCode">
      <div class="scroll-demo">
        <demo-card>
          <div class="scroll-area">
            <span class="scroll-hint">Scroll anywhere to test</span>
          </div>
        </demo-card>

        <demo-card>
          <div class="coords-grid">
            <div class="coord-item">
              <span class="coord-label">X</span>
              <span class="coord-value">{{ scrollPos.x() }}px</span>
            </div>
            <div class="coord-item">
              <span class="coord-label">Y</span>
              <span class="coord-value">{{ scrollPos.y() }}px</span>
            </div>
          </div>
        </demo-card>

        <demo-card>
          <div class="arrived-grid">
            <div class="arrived-item" [class.active]="scrollPos.arrivedState().top">
              <span>Top</span>
            </div>
            <div class="arrived-item" [class.active]="scrollPos.arrivedState().bottom">
              <span>Bottom</span>
            </div>
          </div>
        </demo-card>
      </div>
    </ng-demo-wrapper>
  `,
  styles: `
    .scroll-demo {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .scroll-area {
      height: 80px;
      background: #161618;
      border: 1px dashed #3f3f46;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .scroll-hint {
      font-size: 0.875rem;
      color: #71717a;
    }

    .coords-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .coord-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .coord-label {
      font-size: 0.75rem;
      font-weight: 500;
      color: #a1a1aa;
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }

    .coord-value {
      font-size: 1rem;
      font-weight: 600;
      color: #e4e4e7;
    }

    .arrived-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.5rem;
    }

    .arrived-item {
      padding: 0.5rem;
      text-align: center;
      font-size: 0.75rem;
      font-weight: 500;
      color: #71717a;
      background: #27272a;
      border-radius: 4px;
      transition: all 0.2s ease;
    }

    .arrived-item.active {
      color: #22c55e;
      background: rgba(34, 197, 94, 0.15);
    }
  `,
})
export class ScrollDemo {
  readonly scrollPos = scroll();

  readonly importCode = `import { scroll } from '@signality/core'`;
}

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
      </div>
    </ng-demo-wrapper>
  `,
  styles: `
    .scroll-demo {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
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
  `,
})
export class ScrollDemo {
  readonly scrollPos = scroll();

  readonly importCode = `import { scroll } from '@signality/core'`;
}

import { ChangeDetectionStrategy, Component, ViewEncapsulation, viewChild } from '@angular/core';
import { elementSize } from '@signality/core/elements/element-size';
import { DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-element-size',
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard],
  template: `
    <ng-demo-wrapper [code]="importCode">
      <div class="size-demo">
        <div #resizable class="resizable-box">
          <span class="box-hint">Resize this box</span>
        </div>

        <demo-card>
          <div class="size-grid">
            <div class="size-item">
              <span class="size-label">Width</span>
              <span class="size-value">{{ size().width }}px</span>
            </div>
            <div class="size-item">
              <span class="size-label">Height</span>
              <span class="size-value">{{ size().height }}px</span>
            </div>
          </div>
        </demo-card>
      </div>
    </ng-demo-wrapper>
  `,
  styles: `
    .size-demo {
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
      font-size: 0.75rem;
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
export class ElementSizeDemo {
  readonly resizable = viewChild<HTMLElement>('resizable');
  readonly size = elementSize(this.resizable);

  readonly importCode = `import { elementSize } from '@signality/core'`;
}

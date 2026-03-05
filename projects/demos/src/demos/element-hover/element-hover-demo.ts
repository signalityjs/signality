import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { elementHover } from '@signality/core/elements/element-hover';
import { DemoBadge, DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-element-hover',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard, DemoBadge],
  template: `
    <ng-demo-wrapper [code]="importCode">
      <div class="hover-demo">
        <div #hoverEl class="hover-box" [class.hovered]="isHovered()">
          <span class="hover-text">Hover over me</span>
        </div>

        <demo-card>
          <div class="hover-result">
            <span class="hover-label">Hover state:</span>
            <demo-badge [type]="isHovered() ? 'success' : 'neutral'">
              {{ isHovered() ? 'Hovered' : 'Not hovered' }}
            </demo-badge>
          </div>
        </demo-card>
      </div>
    </ng-demo-wrapper>
  `,
  styles: `
    .hover-demo {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .hover-box {
      height: 80px;
      background: #161618;
      border: 1px dashed #3f3f46;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      cursor: pointer;
    }

    .hover-box.hovered {
      border-color: #22c55e;
      background: rgba(34, 197, 94, 0.1);
    }

    .hover-text {
      font-size: 0.875rem;
      color: #71717a;
    }

    .hover-box.hovered .hover-text {
      color: #22c55e;
    }

    .hover-result {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .hover-label {
      font-size: 0.875rem;
      font-weight: 500;
      color: #a1a1aa;
    }
  `,
})
export class ElementHoverDemo {
  readonly hoverEl = viewChild<HTMLElement>('hoverEl');
  readonly isHovered = elementHover(this.hoverEl);

  readonly importCode = `import { elementHover } from '@signality/core'`;
}

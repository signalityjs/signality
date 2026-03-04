import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  viewChild,
  ElementRef,
} from '@angular/core';
import { elementVisibility } from '@signality/core/elements/element-visibility';
import { DemoCard, DemoButton, Wrapper } from '../../common';

@Component({
  selector: 'demo-element-visibility',
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard, DemoButton],
  template: `
    <ng-demo-wrapper [code]="importCode">
      <div class="visibility-card">
        <div #scrollContainer class="scroll-container">
          <div #targetBox class="target-box" [class.visible]="visibility().isVisible">
            <span class="box-label">{{ visibility().isVisible ? 'Visible' : 'Not Visible' }}</span>
          </div>
        </div>

        <demo-card>
          <div class="status-info">
            <div class="info-row">
              <span class="info-label">Status</span>
              <span class="info-value" [class.active]="visibility().isVisible">
                {{ visibility().isVisible ? 'Intersecting' : 'Not Intersecting' }}
              </span>
            </div>
          </div>
        </demo-card>

        <demo-button variant="secondary" (click)="scrollToBox()"> Scroll into View </demo-button>
      </div>
    </ng-demo-wrapper>
  `,
  styles: `
    .visibility-card {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .scroll-container {
      height: 125px;
      overflow-y: auto;
      background: #161618;
      border: 1px solid #3f3f46;
      border-radius: 8px;
      padding: 1rem;
    }

    .target-box {
      height: 80px;
      background: #232125;
      border: 2px dashed #3f3f46;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      margin-bottom: 200px;
      margin-top: 20px;
    }

    .target-box.visible {
      border-color: #22c55e;
      background: rgba(34, 197, 94, 0.1);
    }

    .box-label {
      font-size: 0.875rem;
      font-weight: 500;
      color: #71717a;
    }

    .target-box.visible .box-label {
      color: #22c55e;
    }

    .status-info {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
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
    }

    .info-value.active {
      color: #22c55e;
    }
  `,
})
export class ElementVisibilityDemo {
  readonly box = viewChild<ElementRef>('targetBox');
  readonly scrollContainer = viewChild<ElementRef>('scrollContainer');
  readonly visibility = elementVisibility(this.box, { root: undefined });

  readonly importCode = `import { elementVisibility } from '@signality/core'`;

  scrollToBox(): void {
    this.box()?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

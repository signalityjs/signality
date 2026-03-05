import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { mouse } from '@signality/core/elements/mouse';
import { DemoCard, DemoToggle, Wrapper } from '../../common';

@Component({
  selector: 'demo-mouse',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard, DemoToggle],
  template: `
    <ng-demo-wrapper [code]="importCode">
      <div class="mouse-card">
        <div
          class="cursor-follower"
          [class.visible]="isVisible()"
          [style.left.px]="position().x"
          [style.top.px]="position().y"
        ></div>

        <demo-card>
          <div class="coords-grid">
            <div class="coord-item">
              <span class="coord-label">X</span>
              <span class="coord-value">{{ position().x }}</span>
            </div>
            <div class="coord-item">
              <span class="coord-label">Y</span>
              <span class="coord-value">{{ position().y }}</span>
            </div>
          </div>
        </demo-card>
      </div>
    </ng-demo-wrapper>
  `,
  styles: `
    .mouse-card {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      position: relative;
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
      font-size: 1.25rem;
      font-weight: 600;
      color: #e4e4e7;
      font-variant-numeric: tabular-nums;
    }

    .cursor-follower {
      position: fixed;
      width: 10px;
      height: 10px;
      background: #DEB3EB;
      border-radius: 50%;
      pointer-events: none;
      transform: translate(-50%, -50%);
      transition: opacity 0.2s ease;
      opacity: 0;
      box-shadow: 0 0 10px #DEB3EB, 0 0 20px rgba(222, 179, 235, 0.5);
      z-index: 10;

      &.visible {
        opacity: 1;
      }
    }
  `,
})
export class MouseDemo {
  readonly position = mouse({ type: 'client' });

  readonly isVisible = computed(() => this.position().x !== 0 && this.position().y !== 0);

  readonly importCode = `import { mouse } from '@signality/core'`;
}

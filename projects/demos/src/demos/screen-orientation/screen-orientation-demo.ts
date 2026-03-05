import { ChangeDetectionStrategy, Component } from '@angular/core';
import { screenOrientation } from '@signality/core/browser/screen-orientation';
import { DemoBadge, DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-screen-orientation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard, DemoBadge],
  template: `
    <ng-demo-wrapper [code]="importCode">
      <div class="orientation-card">
        <demo-card>
          <div class="orientation-display">
            <div class="orientation-icon" [class.landscape]="isLandscape()">
              <svg
                width="32"
                height="48"
                viewBox="0 0 24 36"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
              >
                <rect x="2" y="6" width="20" height="24" rx="2" />
              </svg>
            </div>
            <demo-badge [type]="isLandscape() ? 'info' : 'success'">
              {{ orientation() }}
            </demo-badge>
          </div>
        </demo-card>
      </div>
    </ng-demo-wrapper>
  `,
  styles: `
    .orientation-card {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .orientation-display {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
    }

    .orientation-icon {
      color: #a1a1aa;
      transition: transform 0.3s ease;
    }

    .orientation-icon.landscape {
      transform: rotate(90deg);
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .info-label {
      font-size: 0.875rem;
      font-weight: 500;
      color: #a1a1aa;
    }

    .info-value {
      font-size: 0.875rem;
      color: #e4e4e7;
    }
  `,
})
export class ScreenOrientationDemo {
  readonly orientation = screenOrientation();

  readonly importCode = `import { screenOrientation } from '@signality/core'`;

  isLandscape(): boolean {
    const type = this.orientation();
    return type.includes('landscape');
  }
}

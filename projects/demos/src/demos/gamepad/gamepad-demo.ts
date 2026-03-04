import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { gamepad } from '@signality/core/browser/gamepad';
import { DemoBadge, DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-gamepad',
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard, DemoBadge],
  template: `
    <ng-demo-wrapper [code]="importCode">
      <div class="gamepad-card">
        @if (!gp.isSupported()) {
        <demo-card>
          <div class="not-supported">
            <demo-badge type="error">Gamepad API not supported</demo-badge>
            <p class="not-supported-text">Use a browser with Gamepad API support.</p>
          </div>
        </demo-card>
        } @else if (!gp.activeGamepad()) {
        <demo-card>
          <div class="not-connected">
            <div class="gamepad-icon">
              <svg
                width="48"
                height="32"
                viewBox="0 0 48 32"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
              >
                <rect x="2" y="8" width="44" height="16" rx="8" />
                <circle cx="12" cy="16" r="3" />
                <circle cx="36" cy="16" r="3" />
              </svg>
            </div>
            <p class="not-connected-text">Connect a gamepad to test</p>
            <p class="not-connected-hint">Press any button on your gamepad</p>
          </div>
        </demo-card>
        } @else {
        <demo-card>
          <div class="gamepad-info">
            <span class="gamepad-name">{{ gp.activeGamepad()?.id }}</span>
            <demo-badge type="success">Connected</demo-badge>
          </div>
        </demo-card>

        <demo-card>
          <div class="buttons-grid">
            @for (button of gp.buttons(); track $index) {
            <div class="button-item" [class.pressed]="button.pressed">
              <span class="button-index">{{ $index }}</span>
            </div>
            }
          </div>
        </demo-card>

        <demo-card>
          <div class="axes-list">
            @for (axis of gp.axes(); track $index) {
            <div class="axis-item">
              <span class="axis-label">Axis {{ $index }}</span>
              <div class="axis-bar">
                <div class="axis-fill" [style.width.%]="getAxisPercent(axis)"></div>
                <div class="axis-center"></div>
              </div>
              <span class="axis-value">{{ axis.toFixed(2) }}</span>
            </div>
            }
          </div>
        </demo-card>
        }
      </div>
    </ng-demo-wrapper>
  `,
  styles: `
    .gamepad-card {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .not-supported, .not-connected {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      text-align: center;
    }

    .not-supported-text, .not-connected-text {
      color: #a1a1aa;
      font-size: 0.875rem;
      margin: 0;
    }

    .not-connected-hint {
      color: #71717a;
      font-size: 0.75rem;
      margin: 0;
    }

    .gamepad-icon {
      color: #71717a;
    }

    .gamepad-info {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .gamepad-name {
      font-size: 0.75rem;
      color: #e4e4e7;
      word-break: break-all;
    }

    .buttons-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.5rem;
    }

    .button-item {
      aspect-ratio: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #27272a;
      border-radius: 4px;
      transition: background 0.1s ease;
    }

    .button-item.pressed {
      background: #DEB3EB;
    }

    .button-index {
      font-size: 0.625rem;
      font-weight: 500;
      color: #71717a;
    }

    .button-item.pressed .button-index {
      color: #0f0f11;
    }

    .axes-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .axis-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .axis-label {
      font-size: 0.75rem;
      color: #a1a1aa;
      min-width: 40px;
    }

    .axis-bar {
      flex: 1;
      height: 8px;
      background: #27272a;
      border-radius: 4px;
      position: relative;
      overflow: hidden;
    }

    .axis-center {
      position: absolute;
      left: 50%;
      top: 0;
      bottom: 0;
      width: 2px;
      background: #3f3f46;
      transform: translateX(-50%);
    }

    .axis-fill {
      position: absolute;
      top: 0;
      bottom: 0;
      background: #DEB3EB;
    }

    .axis-value {
      font-size: 0.75rem;
      color: #e4e4e7;
      font-variant-numeric: tabular-nums;
      min-width: 40px;
      text-align: right;
    }
  `,
})
export class GamepadDemo {
  readonly gp = gamepad();

  readonly importCode = `import { gamepad } from '@signality/core'`;

  getAxisPercent(value: number): number {
    return Math.abs(value) * 50;
  }
}

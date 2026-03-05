import { ChangeDetectionStrategy, Component } from '@angular/core';
import { vibrate } from '@signality/core/browser/vibrate';
import { DemoBadge, DemoButton, DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-vibrate',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard, DemoButton, DemoBadge],
  template: `
    <ng-demo-wrapper [code]="importCode">
      <div class="vibrate-card">
        @if (!vib.isSupported()) {
        <demo-card>
          <div class="not-supported">
            <demo-badge type="error">Vibration API not supported</demo-badge>
            <p class="not-supported-text">Use a mobile device with vibration support.</p>
          </div>
        </demo-card>
        } @else {
        <demo-card>
          <div class="vibrate-status">
            <span class="status-label">Status</span>
            <demo-badge [type]="vib.isVibrating() ? 'warning' : 'neutral'">
              {{ vib.isVibrating() ? 'Vibrating' : 'Idle' }}
            </demo-badge>
          </div>
        </demo-card>

        <div class="buttons-row">
          <demo-button variant="primary" (click)="vibrate()">Vibrate</demo-button>
          <demo-button variant="secondary" (click)="vibratePattern()">Pattern</demo-button>
        </div>
        }
      </div>
    </ng-demo-wrapper>
  `,
  styles: `
    .vibrate-card {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .not-supported {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      text-align: center;
    }

    .not-supported-text {
      color: #a1a1aa;
      font-size: 0.875rem;
      margin: 0;
    }

    .vibrate-status {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .status-label {
      font-size: 0.875rem;
      font-weight: 500;
      color: #a1a1aa;
    }

    .buttons-row {
      display: flex;
      gap: 0.75rem;
    }

    .buttons-row demo-button {
      flex: 1;
    }
  `,
})
export class VibrateDemo {
  readonly vib = vibrate();

  readonly importCode = `import { vibrate } from '@signality/core'`;

  vibrate(): void {
    this.vib.vibrate(200);
  }

  vibratePattern(): void {
    this.vib.vibrate([100, 50, 100, 50, 200]);
  }
}

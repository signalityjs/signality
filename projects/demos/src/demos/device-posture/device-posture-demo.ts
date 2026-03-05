import { ChangeDetectionStrategy, Component } from '@angular/core';
import { devicePosture } from '@signality/core/browser/device-posture';
import { DemoBadge, Wrapper } from '../../common';

@Component({
  selector: 'demo-device-posture',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoBadge],
  template: `
    <ng-demo-wrapper [code]="importCode">
      @if (!posture.isSupported()) {
      <div class="not-supported">
        <demo-badge type="error">Device Posture API not supported</demo-badge>
        <p class="not-supported-text">Use a Chromium-based browser on a foldable device.</p>
      </div>
      } @if (posture.isSupported()) {
      <div class="posture-card">
        <div class="device-icon" [class.folded]="posture.type() === 'folded'">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            @if (posture.type() === 'folded') {
            <rect x="4" y="2" width="16" height="20" rx="2" />
            <line x1="12" y1="6" x2="12" y2="18" stroke-dasharray="2 2" />
            } @else {
            <rect x="5" y="2" width="14" height="20" rx="2" />
            }
          </svg>
        </div>
        <demo-badge [type]="posture.type() === 'folded' ? 'warning' : 'success'">
          {{ posture.type() }}
        </demo-badge>
        <p class="posture-hint">
          @if (posture.type() === 'folded') { Device is folded } @else { Device is flat }
        </p>
      </div>
      }
    </ng-demo-wrapper>
  `,
  styles: `
    .not-supported {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      padding: 2rem;
      text-align: center;
    }

    .not-supported-text {
      color: #a1a1aa;
      font-size: 0.875rem;
      margin: 0;
    }

    .posture-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
    }

    .device-icon {
      color: #a1a1aa;
      transition: color 0.3s ease, transform 0.3s ease;
    }

    .device-icon.folded {
      color: #f59e0b;
      transform: scale(1.1);
    }

    .posture-hint {
      color: #71717a;
      font-size: 0.875rem;
      margin: 0;
    }
  `,
})
export class DevicePostureDemo {
  readonly posture = devicePosture();

  readonly importCode = `import { devicePosture } from '@signality/core'`;
}

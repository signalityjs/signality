import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { geolocation } from '@signality/core/browser/geolocation';
import { DemoBadge, DemoButton, DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-geolocation',
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard, DemoButton, DemoBadge],
  template: `
    <ng-demo-wrapper [code]="importCode">
      <div class="geo-card">
        @if (!geo.isSupported()) {
        <demo-card>
          <div class="not-supported">
            <demo-badge type="error">Geolocation not supported</demo-badge>
            <p class="not-supported-text">Use a browser with Geolocation support.</p>
          </div>
        </demo-card>
        } @else {
        <demo-card>
          <div class="status-row">
            <span class="status-label">Status</span>
            <demo-badge [type]="getStatusType()">
              {{ getStatusText() }}
            </demo-badge>
          </div>
        </demo-card>

        @if (geo.coords()) {
        <demo-card>
          <div class="coords-grid">
            <div class="coord-item">
              <span class="coord-label">Latitude</span>
              <span class="coord-value">{{ geo.coords()?.latitude?.toFixed(6) }}</span>
            </div>
            <div class="coord-item">
              <span class="coord-label">Longitude</span>
              <span class="coord-value">{{ geo.coords()?.longitude?.toFixed(6) }}</span>
            </div>
          </div>
        </demo-card>
        } @if (geo.error()) {
        <demo-card>
          <div class="error-row">
            <demo-badge type="error">{{ geo.error()?.message }}</demo-badge>
          </div>
        </demo-card>
        }

        <demo-button variant="primary" (click)="toggleTracking()">
          {{ geo.isLoading() ? 'Loading...' : geo.position() ? 'Stop' : 'Get Location' }}
        </demo-button>
        }
      </div>
    </ng-demo-wrapper>
  `,
  styles: `
    .geo-card {
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

    .status-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .status-label {
      font-size: 0.875rem;
      font-weight: 500;
      color: #a1a1aa;
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
    }

    .coord-value {
      font-size: 0.875rem;
      color: #e4e4e7;
      font-variant-numeric: tabular-nums;
    }

    .error-row {
      display: flex;
      justify-content: center;
    }
  `,
})
export class GeolocationDemo {
  readonly geo = geolocation({ immediate: false });

  readonly importCode = `import { geolocation } from '@signality/core'`;

  getStatusType(): 'success' | 'warning' | 'error' | 'neutral' {
    if (this.geo.error()) return 'error';
    if (this.geo.isLoading()) return 'warning';
    if (this.geo.position()) return 'success';
    return 'neutral';
  }

  getStatusText(): string {
    if (this.geo.error()) return 'Error';
    if (this.geo.isLoading()) return 'Loading...';
    if (this.geo.position()) return 'Located';
    return 'Idle';
  }

  toggleTracking(): void {
    if (this.geo.position()) {
      this.geo.pause();
    } else {
      this.geo.resume();
    }
  }
}

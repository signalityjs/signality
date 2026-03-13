import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
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

        @if (geo.isActive() && mapUrl) {
        <demo-card>
          <iframe [src]="mapUrl" loading="lazy" title="Location map" class="map-iframe"></iframe>
        </demo-card>
        } @if (geo.isActive() && geo.position()?.coords) {
        <demo-card>
          <div class="coords-grid">
            <div class="coord-item">
              <span class="coord-label">Latitude</span>
              <span class="coord-value">{{ geo.position()?.coords?.latitude?.toFixed(6) }}</span>
            </div>
            <div class="coord-item">
              <span class="coord-label">Longitude</span>
              <span class="coord-value">{{ geo.position()?.coords?.longitude?.toFixed(6) }}</span>
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
          {{ geo.isLoading() ? 'Loading...' : geo.isActive() ? 'Stop' : 'Get Location' }}
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

    .map-iframe {
      width: 100%;
      height: 200px;
      border: none;
      border-radius: 0.5rem;
    }
  `,
})
export class GeolocationDemo {
  readonly geo = geolocation();

  constructor(private readonly domSanitizer: DomSanitizer) {}

  get mapUrl(): SafeResourceUrl | null {
    const coords = this.geo.position()?.coords;
    if (!coords) return null;

    const { latitude, longitude } = coords;
    const bbox = `${longitude - 0.005},${latitude - 0.005},${longitude + 0.005},${
      latitude + 0.005
    }`;
    const url = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&marker=${latitude},${longitude}`;

    return this.domSanitizer.bypassSecurityTrustResourceUrl(url);
  }

  readonly importCode = `import { geolocation } from '@signality/core'`;

  getStatusType(): 'success' | 'warning' | 'error' | 'neutral' {
    if (this.geo.error()) return 'error';
    if (this.geo.isLoading()) return 'warning';
    if (this.geo.isActive()) return 'success';
    return 'neutral';
  }

  getStatusText(): string {
    if (this.geo.error()) return 'Error';
    if (this.geo.isLoading()) return 'Loading...';
    if (this.geo.isActive()) return 'Active';
    return 'Inactive';
  }

  toggleTracking(): void {
    if (this.geo.isActive()) {
      this.geo.stop();
    } else {
      this.geo.start();
    }
  }
}

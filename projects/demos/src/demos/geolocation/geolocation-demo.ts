import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  ViewEncapsulation,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { geolocation } from '@signality/core/browser/geolocation';
import { DemoCard, DemoNotSupported, Wrapper } from '../../common';

@Component({
  selector: 'demo-geolocation',
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard, DemoNotSupported],
  template: `
    <ng-demo-wrapper [demoPath]="'geolocation/geolocation-demo'" [code]="importCode">
      @if (!geo.isSupported()) {
      <demo-not-supported
        title="Not Available"
        description="Geolocation API is not supported in this browser."
        [hints]="['Chrome', 'Firefox', 'Safari']"
      >
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      </demo-not-supported>
      } @else {
      <demo-card>
        <!-- Map / placeholder (fixed 200px — no layout jump) -->
        <div class="geo-map-area">
          @if (coords()) {
          <iframe [src]="mapUrl()" loading="lazy" title="Location map" class="geo-iframe"></iframe>
          } @else {
          <div class="geo-placeholder">
            <svg
              class="geo-pin"
              [class.geo-pin--loading]="geo.isLoading()"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span class="geo-placeholder-text">
              {{ geo.isLoading() ? 'Acquiring location…' : 'Press Get Location to start' }}
            </span>
          </div>
          }
        </div>

        <!-- Coord rows — expands via max-height transition -->
        <div class="geo-coord-area" [class.geo-coord-area--visible]="!!coords()">
          <div class="geo-rows">
            <div class="geo-row">
              <span class="geo-label">Latitude</span>
              <span class="geo-value">{{ coords()?.latitude?.toFixed(6) }}</span>
            </div>
            <div class="geo-row">
              <span class="geo-label">Longitude</span>
              <span class="geo-value">{{ coords()?.longitude?.toFixed(6) }}</span>
            </div>
            <div class="geo-row geo-row--last">
              <span class="geo-label">Accuracy</span>
              <span class="geo-value">{{ coords()?.accuracy?.toFixed(0) }} m</span>
            </div>
          </div>
        </div>

        <!-- Error area — expands via max-height transition -->
        <div class="geo-error-area" [class.geo-error-area--visible]="!!geo.error()">
          <p class="geo-error-text">{{ geo.error()?.message }}</p>
        </div>

        <!-- Divider + footer -->
        <div class="geo-divider"></div>
        <div class="geo-footer">
          <span class="geo-status" [class.geo-status--on]="geo.isActive() || geo.isLoading()">
            <span
              class="geo-dot"
              [class.geo-dot--loading]="geo.isLoading()"
              [class.geo-dot--active]="geo.isActive() && !geo.isLoading() && !geo.error()"
              [class.geo-dot--error]="!!geo.error()"
            ></span>
            {{ statusText() }}
          </span>
          <button class="geo-btn" (click)="toggleTracking()">
            {{ geo.isActive() ? 'Stop' : 'Get Location' }}
          </button>
        </div>
      </demo-card>
      }
    </ng-demo-wrapper>
  `,
  styles: `
    /* ── Map area ── */
    .geo-map-area {
      width: 100%;
      height: 200px;
      border-radius: 8px;
      overflow: hidden;
      background: #0c0c0e;
      border: 1px solid #1f1f22;
      flex-shrink: 0;
    }

    .geo-iframe {
      width: 100%;
      height: 100%;
      border: none;
      display: block;
    }

    /* ── Placeholder ── */
    .geo-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.625rem;
    }

    .geo-pin {
      color: #3f3f46;
      transition: color 0.3s ease;
    }

    .geo-pin--loading {
      color: #71717a;
      animation: geoPinPulse 1.5s ease-in-out infinite;
    }

    @keyframes geoPinPulse {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0.35; }
    }

    .geo-placeholder-text {
      font-size: 0.75rem;
      color: #71717a;
    }

    /* ── Coord rows (max-height reveal) ── */
    .geo-coord-area {
      max-height: 0;
      overflow: hidden;
      opacity: 0;
      transition: max-height 0.4s ease, opacity 0.3s ease;
    }

    .geo-coord-area--visible {
      max-height: 160px;
      opacity: 1;
    }

    .geo-rows {
      display: flex;
      flex-direction: column;
      padding-top: 0.875rem;
    }

    .geo-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.625rem 0;
      border-bottom: 1px solid #1f1f22;
      gap: 1rem;
    }

    .geo-row:first-child {
      padding-top: 0;
    }

    .geo-row--last {
      border-bottom: none;
      padding-bottom: 0;
    }

    .geo-label {
      font-size: 0.8125rem;
      color: #71717a;
      flex-shrink: 0;
    }

    .geo-value {
      font-size: 0.8125rem;
      color: #a1a1aa;
      font-weight: 500;
      text-align: right;
    }

    /* ── Error area (max-height reveal) ── */
    .geo-error-area {
      max-height: 0;
      overflow: hidden;
      opacity: 0;
      transition: max-height 0.3s ease, opacity 0.3s ease;
    }

    .geo-error-area--visible {
      max-height: 60px;
      opacity: 1;
    }

    .geo-error-text {
      font-size: 0.8125rem;
      color: #ef4444;
      margin: 0.75rem 0 0;
      line-height: 1.4;
    }

    /* ── Divider ── */
    .geo-divider {
      height: 1px;
      background: #1f1f22;
      margin: 0.875rem 0 0;
    }

    /* ── Footer ── */
    .geo-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 0.75rem;
    }

    .geo-status {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8125rem;
      color: #71717a;
      transition: color 0.3s ease;
    }

    .geo-status--on {
      color: #a1a1aa;
    }

    /* ── Status dot ── */
    .geo-dot {
      position: relative;
      width: 6px;
      height: 6px;
      flex-shrink: 0;
    }

    .geo-dot::before,
    .geo-dot::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: #3f3f46;
      transition: background 0.3s ease;
    }

    .geo-dot--loading::before,
    .geo-dot--loading::after {
      background: #DEB3EB;
    }

    .geo-dot--loading::after {
      animation: geoPulse 1.2s ease-out infinite;
    }

    .geo-dot--active::before,
    .geo-dot--active::after {
      background: #22c55e;
    }

    .geo-dot--error::before,
    .geo-dot--error::after {
      background: #ef4444;
    }

    @keyframes geoPulse {
      0%   { transform: scale(1); opacity: 0.6; }
      100% { transform: scale(3); opacity: 0; }
    }

    /* ── Button ── */
    .geo-btn {
      font-size: 0.8125rem;
      font-family: inherit;
      color: #DEB3EB;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
      transition: color 0.15s ease;
    }

    .geo-btn:hover {
      color: #e8c8f5;
    }
  `,
})
export class GeolocationDemo {
  private readonly sanitizer = inject(DomSanitizer);

  readonly geo = geolocation({ immediate: true });

  readonly coords = computed(() => this.geo.position()?.coords ?? null);

  readonly mapUrl = computed(() => {
    const c = this.coords();
    if (!c) return null;
    const { latitude: lat, longitude: lng } = c;
    const bbox = `${lng - 0.005},${lat - 0.005},${lng + 0.005},${lat + 0.005}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&marker=${lat},${lng}`
    );
  });

  readonly statusText = computed(() => {
    if (this.geo.error()) return 'Error';
    if (this.geo.isLoading()) return 'Locating…';
    if (this.geo.isActive()) return 'Active';
    return 'Idle';
  });

  readonly importCode = `import { geolocation } from '@signality/core'`;

  toggleTracking(): void {
    this.geo.isActive() ? this.geo.stop() : this.geo.start();
  }
}

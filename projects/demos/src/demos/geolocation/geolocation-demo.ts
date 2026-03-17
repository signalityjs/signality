import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  ViewEncapsulation,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { geolocation } from '@signality/core';
import { DemoCard, DemoNotSupported, Wrapper } from '../../common';

@Component({
  selector: 'demo-geolocation',
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard, DemoNotSupported],
  templateUrl: './geolocation-demo.html',
  styleUrl: './geolocation-demo.scss',
})
export class GeolocationDemo {
  readonly importCode = `import { geolocation } from '@signality/core'`;

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

  toggleTracking(): void {
    this.geo.isActive() ? this.geo.stop() : this.geo.start();
  }
}

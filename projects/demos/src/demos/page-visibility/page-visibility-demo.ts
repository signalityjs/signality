import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { pageVisibility } from '@signality/core';
import { DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-page-visibility',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard],
  templateUrl: './page-visibility-demo.html',
  styleUrl: './page-visibility-demo.scss',
})
export class PageVisibilityDemo {
  readonly importCode = `import { pageVisibility } from '@signality/core'`;

  readonly visibility = pageVisibility();

  readonly isVisible = computed(() => this.visibility() === 'visible');
  readonly visibleOpacity = computed(() => (this.isVisible() ? 1 : 0));
  readonly hiddenOpacity = computed(() => (this.isVisible() ? 0 : 1));
}

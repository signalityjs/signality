import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { windowFocus } from '@signality/core';
import { DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-window-focus',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard],
  templateUrl: './window-focus-demo.html',
  styleUrl: './window-focus-demo.scss',
})
export class WindowFocusDemo {
  readonly importCode = `import { windowFocus } from '@signality/core'`;

  readonly isFocused = windowFocus();

  readonly focusedOpacity = computed(() => (this.isFocused() ? 1 : 0));
  readonly blurredOpacity = computed(() => (this.isFocused() ? 0 : 1));
}

import { ChangeDetectionStrategy, Component, ElementRef, viewChild } from '@angular/core';
import { elementVisibility } from '@signality/core';
import { DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-element-visibility',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard],
  templateUrl: './element-visibility-demo.html',
  styleUrl: './element-visibility-demo.scss',
})
export class ElementVisibilityDemo {
  readonly importCode = `import { elementVisibility } from '@signality/core'`;

  readonly box = viewChild<ElementRef>('targetBox');
  readonly scrollContainer = viewChild<ElementRef>('scrollContainer');
  readonly visibility = elementVisibility(this.box, { root: this.scrollContainer });

  scrollToBox(): void {
    this.box()?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

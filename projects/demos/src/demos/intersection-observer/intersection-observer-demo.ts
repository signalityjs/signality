import { ChangeDetectionStrategy, Component, ElementRef, signal, viewChild } from '@angular/core';
import { intersectionObserver } from '@signality/core';
import { DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-intersection-observer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard],
  templateUrl: './intersection-observer-demo.html',
  styleUrl: './intersection-observer-demo.scss',
})
export class IntersectionObserverDemo {
  readonly importCode = `import { intersectionObserver } from '@signality/core'`;

  readonly box = viewChild<ElementRef>('targetBox');
  readonly isIntersecting = signal(false);

  constructor() {
    intersectionObserver(
      this.box,
      entries => {
        this.isIntersecting.set(entries[0].isIntersecting);
      },
      { threshold: 0.1 }
    );
  }

  scrollToBox(): void {
    this.box()?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

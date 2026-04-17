import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { DemoCard, DemoInput, Wrapper } from '../../common';
import { SizeFnVirtualScroll, VirtualScrollItemSizeFn } from '@signality/cdk-interop';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'demo-size-fn-virtual-scroll',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard, DemoInput, ScrollingModule, SizeFnVirtualScroll, FormsModule],
  templateUrl: './size-fn-virtual-scroll-demo.html',
  styleUrl: './size-fn-virtual-scroll-demo.scss',
})
export class SizeFnVirtualScrollDemo {
  readonly importCode = `import { SizeFnVirtualScroll } from '@signality/cdk-interop'`;

  evenItemSize = signal(30);
  oddItemSize = signal(50);
  gap = signal(10);
  paddingTop = signal(5);
  paddingBottom = signal(5);
  indexToScrollTo = signal(0);

  itemSizeFn = computed((): VirtualScrollItemSizeFn => {
    const evenItemSize = this.evenItemSize();
    const oddItemSize = this.oddItemSize();

    return index => (index % 2 === 0 ? evenItemSize : oddItemSize);
  });

  protected readonly items = Array.from({ length: 100_000 }).map((_, i) => `Item #${i}`);
}

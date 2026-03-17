import { ChangeDetectionStrategy, Component, ElementRef, signal, viewChild } from '@angular/core';
import { mutationObserver } from '@signality/core';
import { DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-mutation-observer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard],
  templateUrl: './mutation-observer-demo.html',
  styleUrl: './mutation-observer-demo.scss',
})
export class MutationObserverDemo {
  readonly importCode = `import { mutationObserver } from '@signality/core'`;

  readonly container = viewChild<ElementRef>('container');
  readonly items = signal<number[]>([1, 2, 3]);
  readonly mutationCount = signal(0);

  private counter = 3;

  constructor() {
    mutationObserver(
      this.container,
      mutations => {
        this.mutationCount.update(c => c + mutations.length);
      },
      { childList: true }
    );
  }

  addItem(): void {
    this.counter++;
    this.items.update(items => [...items, this.counter]);
  }

  removeItem(): void {
    this.items.update(items => items.slice(0, -1));
  }

  clearAll(): void {
    this.items.set([]);
  }
}

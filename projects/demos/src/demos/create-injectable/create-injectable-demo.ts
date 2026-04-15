import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { createInjectable } from '@signality/core';
import { DemoButton, DemoCard, Wrapper } from '../../common';

const [injectCounter, provideCounter] = createInjectable('Counter', () => {
  const count = signal(0);
  const doubled = computed(() => count() * 2);

  function increment() {
    count.update(v => v + 1);
  }

  return { count: count.asReadonly(), doubled, increment };
});

@Component({
  selector: 'demo-create-injectable',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard, DemoButton, FormsModule],
  providers: [provideCounter()],
  templateUrl: './create-injectable-demo.html',
})
export class CreateInjectableDemo {
  readonly importCode = `import { createInjectable } from '@signality/core'`;

  readonly counter = injectCounter();
}

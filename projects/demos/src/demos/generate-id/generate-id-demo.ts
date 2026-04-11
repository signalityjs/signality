import { ChangeDetectionStrategy, Component, inject, INJECTOR, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { generateId } from '@signality/core';
import { DemoButton, DemoCard, DemoInput, Wrapper } from '../../common';

@Component({
  selector: 'demo-generate-id',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard, DemoInput, DemoButton, FormsModule],
  templateUrl: './generate-id-demo.html',
  styleUrl: './generate-id-demo.scss',
})
export class GenerateIdDemo {
  readonly injector = inject(INJECTOR);
  readonly importCode = `import { generateId } from '@signality/core'`;

  readonly currentId = signal(generateId());
  prefix = 'app';

  generate(): void {
    this.currentId.set(generateId({ prefix: this.prefix, injector: this.injector }));
  }
}

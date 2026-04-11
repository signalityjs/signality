import { ChangeDetectionStrategy, Component, inject, INJECTOR, signal } from '@angular/core';
import { generateId } from '@signality/core';
import { DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-generate-id',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard],
  templateUrl: './generate-id-demo.html',
  styleUrl: './generate-id-demo.scss',
})
export class GenerateIdDemo {
  readonly injector = inject(INJECTOR);
  readonly importCode = `import { generateId } from '@signality/core'`;

  readonly currentId = signal(generateId());
  readonly rotation = signal(0);

  generate(): void {
    this.currentId.set(generateId({ injector: this.injector }));
    this.rotation.update(r => r + 360);
  }
}

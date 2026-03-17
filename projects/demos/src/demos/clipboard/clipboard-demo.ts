import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { clipboard } from '@signality/core';
import { DemoButton, DemoCard, DemoNotSupported, Wrapper } from '../../common';

@Component({
  selector: 'demo-clipboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard, DemoButton, DemoNotSupported, FormsModule],
  templateUrl: './clipboard-demo.html',
  styleUrl: './clipboard-demo.scss',
})
export class ClipboardDemo {
  readonly importCode = `import { clipboard } from '@signality/core'`;

  readonly cb = clipboard();

  text = 'Hello, Signality!';

  async copy(): Promise<void> {
    await this.cb.copy(this.text);
  }

  async paste(): Promise<void> {
    await this.cb.paste();
  }
}

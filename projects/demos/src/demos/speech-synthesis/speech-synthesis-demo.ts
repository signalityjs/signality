import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { speechSynthesis } from '@signality/core';
import { DemoCard, DemoInput, DemoNotSupported, Wrapper } from '../../common';

@Component({
  selector: 'demo-speech-synthesis',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard, DemoInput, DemoNotSupported, FormsModule],
  templateUrl: './speech-synthesis-demo.html',
  styleUrl: './speech-synthesis-demo.scss',
})
export class SpeechSynthesisDemo {
  readonly importCode = `import { speechSynthesis } from '@signality/core'`;

  readonly rate = signal(1);
  readonly pitch = signal(1);

  readonly speech = speechSynthesis({
    rate: this.rate,
    pitch: this.pitch,
  });

  text = 'Hello, this is a speech synthesis demo!';
}

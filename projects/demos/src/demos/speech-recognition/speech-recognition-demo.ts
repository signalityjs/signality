import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { speechRecognition } from '@signality/core';
import { DemoCard, DemoNotSupported, Wrapper } from '../../common';

@Component({
  selector: 'demo-speech-recognition',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard, DemoNotSupported],
  templateUrl: './speech-recognition-demo.html',
  styleUrl: './speech-recognition-demo.scss',
})
export class SpeechRecognitionDemo {
  readonly importCode = `import { speechRecognition } from '@signality/core'`;

  readonly sr = speechRecognition({ lang: 'en-US', interimResults: true });

  readonly errorMessage = computed(() => {
    const err = this.sr.error();
    if (!err) return '';
    if (err instanceof Error) return err.message;
    return err.message || `Recognition error: ${err.error}`;
  });

  toggleListening(): void {
    this.sr.isListening() ? this.sr.stop() : this.sr.start();
  }
}

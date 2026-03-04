import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { speechRecognition } from '@signality/core/browser/speech-recognition';
import { DemoBadge, DemoButton, DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-speech-recognition',
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard, DemoButton, DemoBadge],
  template: `
    <ng-demo-wrapper [code]="importCode">
      <div class="speech-card">
        @if (!sr.isSupported()) {
        <demo-card>
          <div class="not-supported">
            <demo-badge type="error">Speech Recognition not supported</demo-badge>
            <p class="not-supported-text">Use a browser with Speech Recognition API support.</p>
          </div>
        </demo-card>
        } @else {
        <div class="transcript-area">
          @if (sr.isListening()) {
          <div class="listening-indicator">
            <span class="pulse"></span>
            <span class="listening-text">Listening...</span>
          </div>
          } @if (sr.text()) {
          <p class="transcript-text">{{ sr.text() }}</p>
          } @if (sr.interimText() && sr.interimText() !== sr.text()) {
          <p class="interim-text">{{ sr.interimText() }}</p>
          } @if (!sr.isListening() && !sr.text()) {
          <span class="transcript-hint">Press the button and speak</span>
          }
        </div>

        @if (sr.error()) {
        <demo-card>
          <demo-badge type="error">{{ sr.error() }}</demo-badge>
        </demo-card>
        }

        <demo-button variant="primary" (click)="toggleListening()">
          {{ sr.isListening() ? 'Stop' : 'Start' }}
        </demo-button>
        }
      </div>
    </ng-demo-wrapper>
  `,
  styles: `
    .speech-card {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .not-supported {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      text-align: center;
    }

    .not-supported-text {
      color: #a1a1aa;
      font-size: 0.875rem;
      margin: 0;
    }

    .transcript-area {
      min-height: 80px;
      background: #0f0f11;
      border-radius: 8px;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .listening-indicator {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .pulse {
      width: 8px;
      height: 8px;
      background: #ef4444;
      border-radius: 50%;
      animation: pulse 1s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .listening-text {
      font-size: 0.75rem;
      color: #ef4444;
      font-weight: 500;
    }

    .transcript-text {
      font-size: 0.875rem;
      color: #e4e4e7;
      margin: 0;
    }

    .interim-text {
      font-size: 0.875rem;
      color: #71717a;
      margin: 0;
      font-style: italic;
    }

    .transcript-hint {
      font-size: 0.875rem;
      color: #71717a;
    }
  `,
})
export class SpeechRecognitionDemo {
  readonly sr = speechRecognition({ lang: 'en-US' });

  readonly importCode = `import { speechRecognition } from '@signality/core'`;

  toggleListening(): void {
    if (this.sr.isListening()) {
      this.sr.stop();
    } else {
      this.sr.start();
    }
  }
}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { speechSynthesis } from '@signality/core/browser/speech-synthesis';
import { DemoBadge, DemoButton, DemoCard, DemoInput, Wrapper } from '../../common';

@Component({
  selector: 'demo-speech-synthesis',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard, DemoButton, DemoBadge, DemoInput, FormsModule],
  template: `
    <ng-demo-wrapper [code]="importCode">
      <div class="speech-card">
        @if (!speech.isSupported()) {
        <demo-card>
          <div class="not-supported">
            <demo-badge type="error">Speech Synthesis not supported</demo-badge>
            <p class="not-supported-text">Use a browser with Speech Synthesis support.</p>
          </div>
        </demo-card>
        } @else {
        <demo-card>
          <div class="input-row">
            <demo-input
              class="input-flex"
              placeholder="Enter text to speak..."
              [(ngModel)]="text"
            />
            <demo-button variant="primary" (click)="speak()" [disabled]="speech.isSpeaking()">
              {{ speech.isSpeaking() ? 'Speaking...' : 'Speak' }}
            </demo-button>
          </div>
        </demo-card>

        <demo-card>
          <div class="status-row">
            <span class="status-label">Status</span>
            @if (speech.isSpeaking()) {
            <demo-badge type="warning">Speaking</demo-badge>
            } @else {
            <demo-badge type="neutral">Idle</demo-badge>
            }
          </div>
        </demo-card>

        <div class="controls">
          <demo-button
            variant="secondary"
            (click)="speech.stop()"
            [disabled]="!speech.isSpeaking()"
          >
            Stop
          </demo-button>
        </div>
        }
      </div>
    </ng-demo-wrapper>
  `,
  styles: `
    .speech-card {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
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

    .input-row {
      display: flex;
      gap: 0.75rem;
    }

    .input-flex {
      flex: 1;
    }

    .status-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .status-label {
      font-size: 0.875rem;
      font-weight: 500;
      color: #a1a1aa;
    }

    .controls {
      display: flex;
      justify-content: center;
    }
  `,
})
export class SpeechSynthesisDemo {
  readonly speech = speechSynthesis();
  text = 'Hello, this is a speech synthesis demo!';

  readonly importCode = `import { speechSynthesis } from '@signality/core'`;

  speak(): void {
    this.speech.speak(this.text);
  }
}

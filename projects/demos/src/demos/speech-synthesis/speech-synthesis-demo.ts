import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { speechSynthesis } from '@signality/core/browser/speech-synthesis';
import { DemoCard, DemoInput, DemoNotSupported, Wrapper } from '../../common';

@Component({
  selector: 'demo-speech-synthesis',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard, DemoInput, DemoNotSupported, FormsModule],
  template: `
    <ng-demo-wrapper [demoPath]="'speech-synthesis/speech-synthesis-demo'" [code]="importCode">
      @if (!speech.isSupported()) {
      <demo-not-supported
        title="Not supported"
        description="Speech Synthesis is not available in this browser."
      >
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="23" />
          <line x1="8" y1="23" x2="16" y2="23" />
        </svg>
      </demo-not-supported>
      } @else {
      <demo-card>
        <!-- Text input -->
        <input demoInput class="ss-input" placeholder="Enter text to speak…" [(ngModel)]="text" />

        <!-- Divider + footer -->
        <div class="ss-divider"></div>
        <div class="ss-footer">
          <!-- Speaking indicator -->
          <div class="ss-status">
            <div class="ss-wave" [class.ss-wave--active]="speech.isSpeaking()">
              <span class="ss-bar"></span>
              <span class="ss-bar"></span>
              <span class="ss-bar"></span>
            </div>
            <span class="ss-label" [class.ss-label--speaking]="speech.isSpeaking()">
              {{ speech.isSpeaking() ? 'Speaking…' : 'Idle' }}
            </span>
          </div>

          <!-- Actions -->
          <div class="ss-actions">
            <button
              class="ss-btn ss-btn--stop"
              [disabled]="!speech.isSpeaking()"
              (click)="speech.stop()"
            >
              Stop
            </button>
            <button
              class="ss-btn ss-btn--speak"
              [disabled]="speech.isSpeaking() || !text"
              (click)="speak()"
            >
              Speak
            </button>
          </div>
        </div>
      </demo-card>
      }
    </ng-demo-wrapper>
  `,
  styles: `
    .ss-input {
      width: 100%;
    }

    /* ── Divider ── */
    .ss-divider {
      height: 1px;
      background: #1f1f22;
      margin: 0.875rem 0 0;
    }

    /* ── Footer ── */
    .ss-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 0.75rem;
    }

    /* ── Speaking indicator ── */
    .ss-status {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .ss-wave {
      display: flex;
      align-items: center;
      gap: 2px;
      height: 14px;
    }

    .ss-bar {
      display: block;
      width: 2px;
      height: 4px;
      border-radius: 1px;
      background: #3f3f46;
      transition: background 0.3s ease;
    }

    .ss-wave--active .ss-bar {
      background: #DEB3EB;
      animation: ssBar 0.8s ease-in-out infinite;
    }

    .ss-wave--active .ss-bar:nth-child(2) { animation-delay: 0.15s; }
    .ss-wave--active .ss-bar:nth-child(3) { animation-delay: 0.3s; }

    @keyframes ssBar {
      0%, 100% { height: 4px; }
      50%       { height: 12px; }
    }

    .ss-label {
      font-size: 0.8125rem;
      color: #52525b;
      transition: color 0.3s ease;
    }

    .ss-label--speaking {
      color: #71717a;
    }

    /* ── Action buttons ── */
    .ss-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .ss-btn {
      font-size: 0.8125rem;
      font-family: inherit;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
      transition: color 0.15s ease;
    }

    .ss-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .ss-btn--stop {
      color: #52525b;
    }

    .ss-btn--stop:hover:not(:disabled) {
      color: #a1a1aa;
    }

    .ss-btn--speak {
      color: #DEB3EB;
    }

    .ss-btn--speak:hover:not(:disabled) {
      color: #e8c8f5;
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

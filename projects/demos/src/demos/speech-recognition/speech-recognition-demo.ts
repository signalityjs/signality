import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { speechRecognition } from '@signality/core/browser/speech-recognition';
import { DemoCard, DemoNotSupported, Wrapper } from '../../common';

@Component({
  selector: 'demo-speech-recognition',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard, DemoNotSupported],
  template: `
    <ng-demo-wrapper [demoPath]="'speech-recognition/speech-recognition-demo'" [code]="importCode">
      @if (!sr.isSupported()) {
      <demo-not-supported
        title="Not Supported"
        description="Speech Recognition API is not available in this browser."
        [hints]="['Chrome', 'Edge', 'Safari 14.1+']"
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
        <!-- Transcript area -->
        <div class="sr-transcript">
          @if (sr.text() || sr.interimText()) {
          <p class="sr-text">
            {{ sr.text()
            }}<span class="sr-interim" [class.sr-interim--visible]="!!sr.interimText()"
              >{{ sr.text() && sr.interimText() ? ' ' : '' }}{{ sr.interimText() }}</span
            >
          </p>
          } @else {
          <span class="sr-hint">
            {{ sr.isListening() ? 'Speak now…' : 'Press Start and speak' }}
          </span>
          }
        </div>

        <!-- Error area -->
        <div class="sr-error-area" [class.sr-error-area--visible]="!!sr.error()">
          <p class="sr-error-text">{{ errorMessage() }}</p>
        </div>

        <!-- Divider + footer -->
        <div class="sr-divider"></div>
        <div class="sr-footer">
          <!-- Listening indicator -->
          <div class="sr-status">
            <div class="sr-wave" [class.sr-wave--active]="sr.isListening()">
              <span class="sr-bar"></span>
              <span class="sr-bar"></span>
              <span class="sr-bar"></span>
            </div>
            <span class="sr-label" [class.sr-label--listening]="sr.isListening()">
              {{ sr.isListening() ? 'Listening…' : 'Idle' }}
            </span>
          </div>

          <!-- Actions -->
          <button
            class="sr-btn"
            [class.sr-btn--stop]="sr.isListening()"
            [class.sr-btn--start]="!sr.isListening()"
            (click)="toggleListening()"
          >
            {{ sr.isListening() ? 'Stop' : 'Start' }}
          </button>
        </div>
      </demo-card>
      }
    </ng-demo-wrapper>
  `,
  styles: `
    /* ── Transcript area ── */
    .sr-transcript {
      min-height: 72px;
      background: #0c0c0e;
      border: 1px solid #1f1f22;
      border-radius: 8px;
      padding: 0.75rem 1rem;
      display: flex;
      align-items: flex-start;
    }

    .sr-text {
      font-size: 0.875rem;
      color: #e4e4e7;
      margin: 0;
      line-height: 1.6;
      word-break: break-word;
    }

    .sr-interim {
      color: #52525b;
      font-style: italic;
      transition: color 0.2s ease;
    }

    .sr-interim--visible {
      color: #71717a;
    }

    .sr-hint {
      font-size: 0.8125rem;
      color: #3f3f46;
      align-self: center;
      width: 100%;
      text-align: center;
    }

    /* ── Error area ── */
    .sr-error-area {
      max-height: 0;
      overflow: hidden;
      opacity: 0;
      transition: max-height 0.3s ease, opacity 0.3s ease;
    }

    .sr-error-area--visible {
      max-height: 60px;
      opacity: 1;
    }

    .sr-error-text {
      font-size: 0.8125rem;
      color: #ef4444;
      margin: 0.625rem 0 0;
      line-height: 1.4;
    }

    /* ── Divider ── */
    .sr-divider {
      height: 1px;
      background: #1f1f22;
      margin: 0.875rem 0 0;
    }

    /* ── Footer ── */
    .sr-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 0.75rem;
    }

    /* ── Status ── */
    .sr-status {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .sr-wave {
      display: flex;
      align-items: center;
      gap: 2px;
      height: 14px;
    }

    .sr-bar {
      display: block;
      width: 2px;
      height: 4px;
      border-radius: 1px;
      background: #3f3f46;
      transition: background 0.3s ease;
    }

    .sr-wave--active .sr-bar {
      background: #DEB3EB;
      animation: srBar 0.8s ease-in-out infinite;
    }

    .sr-wave--active .sr-bar:nth-child(2) { animation-delay: 0.15s; }
    .sr-wave--active .sr-bar:nth-child(3) { animation-delay: 0.3s; }

    @keyframes srBar {
      0%, 100% { height: 4px; }
      50%       { height: 12px; }
    }

    .sr-label {
      font-size: 0.8125rem;
      color: #52525b;
      transition: color 0.3s ease;
    }

    .sr-label--listening {
      color: #71717a;
    }

    .sr-btn {
      font-size: 0.8125rem;
      font-family: inherit;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
      transition: color 0.15s ease;
    }

    .sr-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .sr-btn--stop {
      color: #52525b;
    }

    .sr-btn--stop:hover {
      color: #a1a1aa;
    }

    .sr-btn--start {
      color: #DEB3EB;
    }

    .sr-btn--start:hover {
      color: #e8c8f5;
    }
  `,
})
export class SpeechRecognitionDemo {
  readonly sr = speechRecognition({ lang: 'en-US', interimResults: true });

  readonly importCode = `import { speechRecognition } from '@signality/core'`;

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

import { type Signal, signal, untracked } from '@angular/core';
import { constSignal, NOOP_FN, setupContext } from '@signality/core/internal';
import type { WithInjector } from '@signality/core/types';

export interface SpeechRecognitionOptions extends WithInjector {
  /**
   * Language for speech recognition.
   * @default 'en-US'
   */
  readonly lang?: string;

  /**
   * Whether to return interim results.
   * @default false
   */
  readonly interimResults?: boolean;

  /**
   * Whether to continue recognition after speech ends.
   * @default false
   */
  readonly continuous?: boolean;

  /**
   * Maximum number of alternative transcripts.
   * @default 1
   */
  readonly maxAlternatives?: number;
}

export interface SpeechRecognitionRef {
  /** Whether Speech Recognition API is supported */
  readonly isSupported: Signal<boolean>;

  /** Whether recognition is currently active */
  readonly isListening: Signal<boolean>;

  /** Final transcript text */
  readonly text: Signal<string>;

  /** Interim transcript text */
  readonly interimText: Signal<string>;

  /** Error message if recognition failed */
  readonly error: Signal<string | null>;

  /** Start speech recognition */
  readonly start: () => void;

  /** Stop speech recognition */
  readonly stop: () => void;

  /** Abort speech recognition */
  readonly abort: () => void;
}

/**
 * Signal-based wrapper around the [Speech Recognition API](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition).
 *
 * @param options - Optional configuration
 * @returns A SpeechRecognitionRef with isSupported, isListening, text, interimText, error signals and control methods
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     @if (recognition.isSupported()) {
 *       <button (click)="toggleRecognition()">
 *         {{ recognition.isListening() ? 'Stop' : 'Start' }} Recording
 *       </button>
 *       <p>{{ recognition.text() }}</p>
 *       @if (recognition.interimText()) {
 *         <p><em>{{ recognition.interimText() }}</em></p>
 *       }
 *     }
 *   `
 * })
 * class SpeechComponent {
 *   readonly recognition = speechRecognition();
 *
 *   toggleRecognition() {
 *     if (this.recognition.isListening()) {
 *       this.recognition.stop();
 *     } else {
 *       this.recognition.start();
 *     }
 *   }
 * }
 * ```
 */
export function speechRecognition(options?: SpeechRecognitionOptions): SpeechRecognitionRef {
  const { runInContext } = setupContext(options?.injector, speechRecognition);

  return runInContext(({ isBrowser, onCleanup }) => {
    const isSupported = constSignal(
      isBrowser && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
    );

    if (!isSupported()) {
      return {
        isSupported,
        isListening: constSignal(false),
        text: constSignal(''),
        interimText: constSignal(''),
        error: constSignal(null),
        start: NOOP_FN,
        stop: NOOP_FN,
        abort: NOOP_FN,
      };
    }

    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    const recognition = new SpeechRecognitionClass();

    const {
      lang = 'en-US',
      interimResults = false,
      continuous = false,
      maxAlternatives = 1,
    } = options ?? {};

    recognition.lang = lang;
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.maxAlternatives = maxAlternatives;

    const isListening = signal(false);
    const text = signal('');
    const interimText = signal('');
    const error = signal<string | null>(null);

    const handleResult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0]?.transcript || result.item(0)?.transcript || '';

        if (result.isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        text.update(t => (t ? t + ' ' : '') + finalTranscript);
        interimText.set('');
      } else if (interimTranscript) {
        interimText.set(interimTranscript);
      }
    };

    const handleError = (event: SpeechRecognitionErrorEvent) => {
      error.set(event.error || event.message || 'Unknown error');
      isListening.set(false);
    };

    const handleStart = () => {
      isListening.set(true);
      error.set(null);

      if (!continuous) {
        text.set('');
        interimText.set('');
      }
    };

    const handleEnd = () => {
      isListening.set(false);
    };

    recognition.onstart = handleStart;
    recognition.onend = handleEnd;
    recognition.onerror = handleError;
    recognition.onresult = handleResult;

    const start = () => {
      try {
        if (!untracked(isListening)) {
          recognition.start();
        }
      } catch (err) {
        error.set(err instanceof Error ? err.message : 'Failed to start recognition');
      }
    };

    const stop = () => {
      if (untracked(isListening)) {
        recognition.stop();
      }
    };

    const abort = () => {
      if (untracked(isListening)) {
        recognition.abort();
      }
    };

    onCleanup(abort);

    return {
      isSupported,
      isListening: isListening.asReadonly(),
      text: text.asReadonly(),
      interimText: interimText.asReadonly(),
      error: error.asReadonly(),
      start,
      stop,
      abort,
    };
  });
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  readonly start: () => void;
  readonly stop: () => void;
  readonly abort: () => void;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  readonly [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  readonly [index: number]: SpeechRecognitionAlternative;
  readonly isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface WindowWithSpeechRecognition extends Window {
  SpeechRecognition: {
    new (): SpeechRecognition;
  };
  webkitSpeechRecognition: {
    new (): SpeechRecognition;
  };
}

import { isSignal, type Signal, signal, untracked } from '@angular/core';
import { constSignal, NOOP_FN, setupContext } from '@signality/core/internal';
import { toValue } from '@signality/core/utilities';
import type { MaybeSignal, WithInjector } from '@signality/core/types';
import { watcher } from '@signality/core/reactivity/watcher';
import { permissionState } from '@signality/core/browser/permission-state';

export interface SpeechRecognitionOptions extends WithInjector {
  /**
   * BCP 47 language tag for recognition (e.g. `'en-US'`).
   *
   * @default 'en-US'
   * @see [SpeechRecognition: lang on MDN](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition/lang)
   */
  readonly lang?: MaybeSignal<string>;

  /**
   * Whether to return interim (in-progress) results alongside final ones.
   *
   * @default false
   * @see [SpeechRecognition: interimResults on MDN](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition/interimResults)
   */
  readonly interimResults?: boolean;

  /**
   * Whether recognition continues after the user stops speaking.
   *
   * @default false
   * @see [SpeechRecognition: continuous on MDN](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition/continuous)
   */
  readonly continuous?: boolean;

  /**
   * Maximum number of alternative recognition results per utterance.
   *
   * @default 1
   * @see [SpeechRecognition: maxAlternatives on MDN](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition/maxAlternatives)
   */
  readonly maxAlternatives?: number;
}

export interface SpeechRecognitionRef {
  /**
   * Whether the Speech Recognition API is supported in the current browser.
   *
   * @see [SpeechRecognition browser compatibility on MDN](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition#browser_compatibility)
   */
  readonly isSupported: Signal<boolean>;

  /**
   * Whether speech recognition is currently active and listening.
   */
  readonly isListening: Signal<boolean>;

  /**
   * Accumulated final transcript text.
   *
   * @see [SpeechRecognitionResult on MDN](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognitionResult)
   */
  readonly text: Signal<string>;

  /**
   * In-progress interim transcript. Only populated when `interimResults` is `true`.
   *
   * @see [SpeechRecognition: interimResults on MDN](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition/interimResults)
   */
  readonly interimText: Signal<string>;

  /**
   * The last recognition error, or `null` if no error occurred.
   *
   * @see [SpeechRecognitionErrorEvent on MDN](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognitionErrorEvent)
   */
  readonly error: Signal<SpeechRecognitionErrorEvent | Error | null>;

  /**
   * Start listening for speech input.
   *
   * @see [SpeechRecognition: start() on MDN](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition/start)
   */
  readonly start: () => void;

  /**
   * Stop listening and return any remaining results.
   *
   * @see [SpeechRecognition: stop() on MDN](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition/stop)
   */
  readonly stop: () => void;

  /**
   * Abort recognition immediately without returning results.
   *
   * @see [SpeechRecognition: abort() on MDN](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition/abort)
   */
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
 * export class SpeechComponent {
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

    const recognition: SpeechRecognition = new SpeechRecognitionClass();

    const {
      lang = 'en-US',
      interimResults = false,
      continuous = false,
      maxAlternatives = 1,
    } = options ?? {};

    recognition.lang = toValue(lang);
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.maxAlternatives = maxAlternatives;

    const isListening = signal(false);
    const text = signal('');
    const interimText = signal('');
    const error = signal<SpeechRecognitionErrorEvent | Error | null>(null);

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
      error.set(event);
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
      recognition.lang = toValue(lang);
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
        error.set(err as Error);
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

    if (isSignal(lang)) {
      watcher(lang, newLang => {
        if (!isListening()) {
          recognition.lang = newLang;
        }
      });
    }

    watcher(permissionState('microphone'), state => {
      if (state === 'denied') {
        abort();
      }
    });

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

/**
 * Local type definitions for Web Speech API (Speech Recognition).
 *
 * @remarks
 * External `@types/dom-speech-recognition` package may conflict with user's other libraries
 * or become outdated. For better DX, we define minimal required interfaces locally
 * without polluting the global namespace with experimental APIs.
 */
type SpeechRecognitionErrorCode =
  | 'aborted'
  | 'audio-capture'
  | 'bad-grammar'
  | 'language-not-supported'
  | 'network'
  | 'no-speech'
  | 'not-allowed'
  | 'service-not-allowed';

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechGrammar {
  src: string;
  weight: number;
}

interface SpeechGrammarList {
  readonly length: number;
  addFromString(string: string, weight?: number): void;
  addFromURI(src: string, weight?: number): void;
  item(index: number): SpeechGrammar;
  [index: number]: SpeechGrammar;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: SpeechRecognitionErrorCode;
  readonly message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  grammars: SpeechGrammarList;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onaudioend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onaudiostart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
  onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onsoundend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onsoundstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onspeechstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  abort(): void;
  start(audioTrack?: MediaStreamTrack): void;
  stop(): void;
}

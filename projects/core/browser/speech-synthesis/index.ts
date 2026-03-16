import { type Signal, signal } from '@angular/core';
import { constSignal, NOOP_FN, setupContext } from '@signality/core/internal';
import type { WithInjector } from '@signality/core/types';

export interface SpeechSynthesisSpeakOptions {
  /**
   * Text to synthesize and speak.
   *
   * @see [SpeechSynthesisUtterance: text on MDN](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance/text)
   */
  readonly text: string;

  /**
   * BCP 47 language tag for the utterance (e.g. `'en-US'`).
   *
   * @see [SpeechSynthesisUtterance: lang on MDN](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance/lang)
   */
  readonly lang?: string;

  /**
   * Speech rate from `0.1` (slowest) to `10` (fastest).
   *
   * @see [SpeechSynthesisUtterance: rate on MDN](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance/rate)
   */
  readonly rate?: number;

  /**
   * Speech pitch from `0` to `2`. `1` is the default.
   *
   * @see [SpeechSynthesisUtterance: pitch on MDN](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance/pitch)
   */
  readonly pitch?: number;

  /**
   * Speech volume from `0` (silent) to `1` (loudest).
   *
   * @see [SpeechSynthesisUtterance: volume on MDN](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance/volume)
   */
  readonly volume?: number;

  /**
   * Specific voice to use for synthesis.
   *
   * @see [SpeechSynthesisUtterance: voice on MDN](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance/voice)
   */
  readonly voice?: SpeechSynthesisVoice;
}

export interface SpeechSynthesisOptions extends WithInjector {
  /**
   * Default BCP 47 language tag (e.g. `'en-US'`).
   *
   * @see [SpeechSynthesisUtterance: lang on MDN](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance/lang)
   */
  readonly lang?: string;

  /**
   * Default speech rate from `0.1` to `10`.
   *
   * @see [SpeechSynthesisUtterance: rate on MDN](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance/rate)
   */
  readonly rate?: number;

  /**
   * Default speech pitch from `0` to `2`.
   *
   * @see [SpeechSynthesisUtterance: pitch on MDN](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance/pitch)
   */
  readonly pitch?: number;

  /**
   * Default speech volume from `0` to `1`.
   *
   * @see [SpeechSynthesisUtterance: volume on MDN](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance/volume)
   */
  readonly volume?: number;

  /**
   * Default voice to use for synthesis.
   *
   * @see [SpeechSynthesisUtterance: voice on MDN](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance/voice)
   */
  readonly voice?: SpeechSynthesisVoice;
}

export interface SpeechSynthesisRef {
  /**
   * Whether the Speech Synthesis API is supported in the current browser.
   *
   * @see [SpeechSynthesis browser compatibility on MDN](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis#browser_compatibility)
   */
  readonly isSupported: Signal<boolean>;

  /**
   * Whether speech is currently being synthesized.
   *
   * @see [SpeechSynthesis: speaking on MDN](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/speaking)
   */
  readonly isSpeaking: Signal<boolean>;

  /**
   * Whether speech synthesis is currently paused.
   *
   * @see [SpeechSynthesis: paused on MDN](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/paused)
   */
  readonly isPaused: Signal<boolean>;

  /**
   * List of available synthesis voices for the current device and browser.
   *
   * @see [SpeechSynthesis: getVoices() on MDN](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/getVoices)
   */
  readonly voices: Signal<SpeechSynthesisVoice[]>;

  /**
   * The text currently being spoken, or `''` if idle.
   */
  readonly currentText: Signal<string>;

  /**
   * Speak the given text, cancelling any ongoing utterance.
   *
   * @see [SpeechSynthesis: speak() on MDN](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/speak)
   */
  readonly speak: (text: string, options?: Partial<SpeechSynthesisSpeakOptions>) => void;

  /**
   * Cancel and stop the current utterance.
   *
   * @see [SpeechSynthesis: cancel() on MDN](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/cancel)
   */
  readonly stop: () => void;

  /**
   * Pause the current utterance.
   *
   * @see [SpeechSynthesis: pause() on MDN](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/pause)
   */
  readonly pause: () => void;

  /**
   * Resume a paused utterance.
   *
   * @see [SpeechSynthesis: resume() on MDN](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/resume)
   */
  readonly resume: () => void;
}

/**
 * Signal-based wrapper around the [Speech Synthesis API](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis).
 *
 * @param options - Optional configuration
 * @returns A SpeechSynthesisRef with isSupported, isSpeaking, isPaused, voices signals and control methods
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     @if (synthesis.isSupported()) {
 *       <button (click)="speakText()" [disabled]="synthesis.isSpeaking()">
 *         {{ synthesis.isSpeaking() ? 'Speaking...' : 'Speak' }}
 *       </button>
 *       <button (click)="synthesis.stop()">Stop</button>
 *     }
 *   `
 * })
 * class TextToSpeechDemo {
 *   readonly synthesis = speechSynthesis();
 *
 *   speakText() {
 *     this.synthesis.speak('Hello, world!');
 *   }
 * }
 * ```
 */
export function speechSynthesis(options?: SpeechSynthesisOptions): SpeechSynthesisRef {
  const { runInContext } = setupContext(options?.injector, speechSynthesis);

  return runInContext(({ onCleanup, isBrowser }) => {
    const isSupported = constSignal(
      isBrowser && 'speechSynthesis' in window && typeof window.speechSynthesis !== 'undefined'
    );

    if (!isSupported()) {
      return {
        isSupported,
        isSpeaking: constSignal(false),
        isPaused: constSignal(false),
        voices: constSignal([]),
        currentText: constSignal(''),
        speak: NOOP_FN,
        stop: NOOP_FN,
        pause: NOOP_FN,
        resume: NOOP_FN,
      };
    }

    const { speechSynthesis } = window;

    const {
      lang: defaultLang,
      rate: defaultRate = 1,
      pitch: defaultPitch = 1,
      volume: defaultVolume = 1,
      voice: defaultVoice,
    } = options ?? {};

    const isSpeaking = signal(false);
    const isPaused = signal(false);
    const voices = signal<SpeechSynthesisVoice[]>(speechSynthesis.getVoices());
    const currentText = signal('');

    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      voices.set(availableVoices);
    };

    const updateSpeakingState = () => {
      isSpeaking.set(speechSynthesis.speaking);
      isPaused.set(speechSynthesis.paused);
    };

    const handleStart = () => {
      isSpeaking.set(true);
      isPaused.set(false);
    };

    const handleEnd = () => {
      isSpeaking.set(false);
      isPaused.set(false);
      currentText.set('');
    };

    const handleError = () => {
      isSpeaking.set(false);
      isPaused.set(false);
      currentText.set('');
    };

    const handlePause = () => {
      isPaused.set(true);
    };

    const handleResume = () => {
      isPaused.set(false);
    };

    const speak = (text: string, speakOptions?: Partial<SpeechSynthesisSpeakOptions>) => {
      if (!text) {
        return;
      }

      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      const {
        lang = defaultLang,
        rate = defaultRate,
        pitch = defaultPitch,
        volume = defaultVolume,
        voice = defaultVoice,
      } = speakOptions ?? {};

      if (lang) utterance.lang = lang;

      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = volume;

      if (voice) utterance.voice = voice;

      utterance.onstart = handleStart;
      utterance.onend = handleEnd;
      utterance.onerror = handleError;
      utterance.onpause = handlePause;
      utterance.onresume = handleResume;

      currentText.set(text);
      speechSynthesis.speak(utterance);

      updateSpeakingState();
    };

    const stop = () => {
      speechSynthesis.cancel();
      isSpeaking.set(false);
      isPaused.set(false);
      currentText.set('');
    };

    const pause = () => {
      if (speechSynthesis.speaking && !speechSynthesis.paused) {
        speechSynthesis.pause();
        isPaused.set(true);
      }
    };

    const resume = () => {
      if (speechSynthesis.paused) {
        speechSynthesis.resume();
        isPaused.set(false);
      }
    };

    onCleanup(stop);

    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }

    return {
      isSupported,
      isSpeaking: isSpeaking.asReadonly(),
      isPaused: isPaused.asReadonly(),
      voices: voices.asReadonly(),
      currentText: currentText.asReadonly(),
      speak,
      stop,
      pause,
      resume,
    };
  });
}

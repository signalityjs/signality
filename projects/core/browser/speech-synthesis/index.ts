import { type Signal, signal } from '@angular/core';
import { constSignal, NOOP_FN, setupContext, toValue } from '@signality/core/internal';
import type { MaybeSignal, WithInjector } from '@signality/core/types';

export interface SpeechSynthesisOptions extends WithInjector {
  /**
   * BCP 47 language tag (e.g. `'en-US'`). Supports reactive values.
   *
   * @see [SpeechSynthesisUtterance: lang on MDN](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance/lang)
   */
  readonly lang?: MaybeSignal<string>;

  /**
   * Speech rate from `0.1` to `10`. Supports reactive values.
   *
   * @default 1
   * @see [SpeechSynthesisUtterance: rate on MDN](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance/rate)
   */
  readonly rate?: MaybeSignal<number>;

  /**
   * Speech pitch from `0` to `2`. Supports reactive values.
   *
   * @default 1
   * @see [SpeechSynthesisUtterance: pitch on MDN](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance/pitch)
   */
  readonly pitch?: MaybeSignal<number>;

  /**
   * Speech volume from `0` to `1`. Supports reactive values.
   *
   * @default 1
   * @see [SpeechSynthesisUtterance: volume on MDN](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance/volume)
   */
  readonly volume?: MaybeSignal<number>;

  /**
   * Voice to use for synthesis. Supports reactive values.
   *
   * @see [SpeechSynthesisUtterance: voice on MDN](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance/voice)
   */
  readonly voice?: MaybeSignal<SpeechSynthesisVoice>;
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
   * Reads current reactive option values (`lang`, `rate`, `pitch`, `volume`, `voice`) at call time.
   *
   * @see [SpeechSynthesis: speak() on MDN](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/speak)
   */
  readonly speak: (text: string) => void;

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
 *       <button (click)="synthesis.speak('Hello, world!')" [disabled]="synthesis.isSpeaking()">
 *         {{ synthesis.isSpeaking() ? 'Speaking...' : 'Speak' }}
 *       </button>
 *       <button (click)="synthesis.stop()">Stop</button>
 *     }
 *   `
 * })
 * class TextToSpeechDemo {
 *   readonly synthesis = speechSynthesis({ rate: 1.5 });
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

    const speak = (text: string) => {
      if (!text) {
        return;
      }

      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      const lang = toValue.untracked(options?.lang);
      const voice = toValue.untracked(options?.voice);

      if (lang) {
        utterance.lang = lang;
      }

      if (voice) {
        utterance.voice = voice;
      }

      utterance.rate = toValue.untracked(options?.rate) ?? 1;
      utterance.pitch = toValue.untracked(options?.pitch) ?? 1;
      utterance.volume = toValue.untracked(options?.volume) ?? 1;

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

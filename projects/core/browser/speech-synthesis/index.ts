import { type Signal, signal } from '@angular/core';
import { constSignal, NOOP_FN, setupContext } from '@signality/core/internal';
import type { WithInjector } from '@signality/core/types';

export interface SpeechSynthesisSpeakOptions {
  /** Text to speak */
  readonly text: string;

  /** Language code (e.g., 'en-US') */
  readonly lang?: string;

  /** Speech rate (0.1 to 10) */
  readonly rate?: number;

  /** Speech pitch (0 to 2) */
  readonly pitch?: number;

  /** Speech volume (0 to 1) */
  readonly volume?: number;

  /** Voice to use */
  readonly voice?: SpeechSynthesisVoice;
}

export interface SpeechSynthesisOptions extends WithInjector {
  /** Default language */
  readonly lang?: string;

  /** Default speech rate */
  readonly rate?: number;

  /** Default pitch */
  readonly pitch?: number;

  /** Default volume */
  readonly volume?: number;

  /** Default voice */
  readonly voice?: SpeechSynthesisVoice;
}

export interface SpeechSynthesisRef {
  /** Whether Speech Synthesis API is supported */
  readonly isSupported: Signal<boolean>;

  /** Whether speech is currently playing */
  readonly isSpeaking: Signal<boolean>;

  /** Whether speech is currently paused */
  readonly isPaused: Signal<boolean>;

  /** Available voices */
  readonly voices: Signal<SpeechSynthesisVoice[]>;

  /** Current speaking text */
  readonly currentText: Signal<string>;

  /** Speak text */
  readonly speak: (text: string, options?: Partial<SpeechSynthesisSpeakOptions>) => void;

  /** Stop speaking */
  readonly stop: () => void;

  /** Pause speaking */
  readonly pause: () => void;

  /** Resume speaking */
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
 * class TextToSpeechComponent {
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

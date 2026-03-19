---
source: https://github.com/signalityjs/signality/blob/main/projects/core/browser/speech-synthesis/index.ts
---

# SpeechSynthesis

Reactive wrapper around the [Speech Synthesis API](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis). Convert text to speech with Angular signals.

<Demo name="speech-synthesis" />

## Usage

```angular-ts
import { Component, signal } from '@angular/core';
import { speechSynthesis } from '@signality/core';

@Component({
  template: `
    <input [(ngModel)]="text" />
    <button
      (click)="speech.speak(text())"
      [disabled]="speech.isSpeaking()"
    >
      Speak
    </button>
    <button
      (click)="speech.stop()"
      [disabled]="!speech.isSpeaking()"
    >
      Stop
    </button>
  `,
})
export class TextToSpeech {
  readonly speech = speechSynthesis(); // [!code highlight]
  readonly text = signal('Hello, world!');
}
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `options` | `SpeechSynthesisOptions` | Optional configuration (see [Options](#options) below) |

## Options

All options support reactive values via `MaybeSignal<T>` — pass a plain value or an Angular signal.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `lang` | `MaybeSignal<string>` | - | Language |
| `rate` | `MaybeSignal<number>` | `1` | Speech rate (0.1 to 10) |
| `pitch` | `MaybeSignal<number>` | `1` | Pitch (0 to 2) |
| `volume` | `MaybeSignal<number>` | `1` | Volume (0 to 1) |
| `voice` | `MaybeSignal<SpeechSynthesisVoice>` | - | Voice |
| `injector` | [`Injector`](https://angular.dev/api/core/Injector) | - | Optional injector for DI context |

## Return Value

The `speechSynthesis()` function returns a `SpeechSynthesisRef` object:

| Property | Type | Description |
|----------|------|-------------|
| `isSupported` | `Signal<boolean>` | Whether Speech Synthesis API is supported |
| `isSpeaking` | `Signal<boolean>` | Whether speech is currently playing |
| `isPaused` | `Signal<boolean>` | Whether speech is currently paused |
| `voices` | `Signal<SpeechSynthesisVoice[]>` | Available voices |
| `currentText` | `Signal<string>` | Current speaking text |
| `speak` | `(text: string) => void` | Speak text |
| `stop` | `() => void` | Stop speaking |
| `pause` | `() => void` | Pause speaking |
| `resume` | `() => void` | Resume speaking |

## Examples

### Reactive options

```angular-ts
import { Component, signal } from '@angular/core';
import { speechSynthesis } from '@signality/core';

@Component({
  template: `
    <label>Rate: {{ rate() }}</label>
    <input type="range" min="0.5" max="2" step="0.1" [value]="rate()" (input)="rate.set(+$any($event.target).value)" />

    <label>Pitch: {{ pitch() }}</label>
    <input type="range" min="0" max="2" step="0.1" [value]="pitch()" (input)="pitch.set(+$any($event.target).value)" />

    <button (click)="speech.speak('Hello, world!')">Speak</button>
    <button (click)="speech.stop()">Stop</button>
  `,
})
export class ReactiveOptions {
  readonly rate = signal(1);
  readonly pitch = signal(1);

  readonly speech = speechSynthesis({ // [!code highlight]
    rate: this.rate, // [!code highlight]
    pitch: this.pitch, // [!code highlight]
  }); // [!code highlight]
}
```

### Voice selection

```angular-ts
import { Component, signal } from '@angular/core';
import { speechSynthesis } from '@signality/core';

@Component({
  template: `
    <select (change)="onVoiceChange($any($event.target).value)">
      @for (voice of speech.voices(); track voice.voiceURI) {
        <option [value]="voice.voiceURI">{{ voice.name }}</option>
      }
    </select>
    <button (click)="speech.speak('Hello, world!')">Speak</button>
  `,
})
export class VoiceSelector {
  readonly selectedVoice = signal<SpeechSynthesisVoice | undefined>(undefined);

  readonly speech = speechSynthesis({
    voice: this.selectedVoice, // [!code highlight]
  });

  onVoiceChange(voiceURI: string) {
    const voice = this.speech.voices().find(v => v.voiceURI === voiceURI);
    this.selectedVoice.set(voice);
  }
}
```

## Browser Compatibility

The Speech Synthesis API has limited browser support. Always check `isSupported()` before using text-to-speech (see [Browser API support detection](/guide/key-concepts#browser-api-support-detection)):

```angular-html
@if (speech.isSupported()) {
  <button (click)="speech.speak('Hello')">Speak</button>
} @else {
  <p>Text-to-speech is not available in this browser</p>
}
```

For detailed browser support information, see [Can I use: Speech Synthesis API](https://caniuse.com/speech-synthesis).

## SSR Compatibility

On the server, signals initialize with safe defaults:

- `isSupported` → `false`
- `isSpeaking` → `false`
- `isPaused` → `false`
- `voices` → `[]`
- `currentText` → `''`
- `speak`, `stop`, `pause`, `resume` → no-op functions

## Type Definitions

```typescript
interface SpeechSynthesisOptions extends WithInjector {
  readonly lang?: MaybeSignal<string>;
  readonly rate?: MaybeSignal<number>;
  readonly pitch?: MaybeSignal<number>;
  readonly volume?: MaybeSignal<number>;
  readonly voice?: MaybeSignal<SpeechSynthesisVoice>;
}

interface SpeechSynthesisRef {
  readonly isSupported: Signal<boolean>;
  readonly isSpeaking: Signal<boolean>;
  readonly isPaused: Signal<boolean>;
  readonly voices: Signal<SpeechSynthesisVoice[]>;
  readonly currentText: Signal<string>;
  readonly speak: (text: string) => void;
  readonly stop: () => void;
  readonly pause: () => void;
  readonly resume: () => void;
}

function speechSynthesis(options?: SpeechSynthesisOptions): SpeechSynthesisRef;
```

---
source: https://github.com/signalityjs/signality/blob/main/projects/core/browser/speech-synthesis/index.ts
---

# SpeechSynthesis

Reactive wrapper around the [Speech Synthesis API](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis). Convert text to speech with Angular signals.

<Demo name="speech-synthesis" />

## Usage

```angular-ts
import { Component } from '@angular/core';
import { speechSynthesis } from '@signality/core';

@Component({
  template: `
    <input [(ngModel)]="text" />
    <button 
      (click)="synthesis.speak(text())" 
      [disabled]="synthesis.isSpeaking()"
    >
      Speak
    </button>
    <button 
      (click)="synthesis.stop()" 
      [disabled]="!synthesis.isSpeaking()"
    >
      Stop
    </button>
  `,
})
export class TextToSpeech {
  readonly synthesis = speechSynthesis(); // [!code highlight]
  readonly text = signal('Hello, world!');
}
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `options` | `SpeechSynthesisOptions` | Optional configuration (see [Options](#options) below) |

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `lang` | `string` | - | Default language |
| `rate` | `number` | `1` | Default speech rate (0.1 to 10) |
| `pitch` | `number` | `1` | Default pitch (0 to 2) |
| `volume` | `number` | `1` | Default volume (0 to 1) |
| `voice` | `SpeechSynthesisVoice` | - | Default voice |
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
| `speak` | `(text: string, options?: Partial<SpeechSynthesisSpeakOptions>) => void` | Speak text |
| `stop` | `() => void` | Stop speaking |
| `pause` | `() => void` | Pause speaking |
| `resume` | `() => void` | Resume speaking |

## Examples

### Voice selection

```angular-ts
import { Component, computed } from '@angular/core';
import { speechSynthesis } from '@signality/core';

@Component({
  template: `
    <select [value]="selectedVoice()" (change)="selectedVoice.set($any($event.target).value)">
      @for (voice of synthesis.voices(); track voice.voiceURI) {
        <option [value]="voice.voiceURI">{{ voice.name }}</option>
      }
    </select>
    <button (click)="speak()">Speak</button>
  `,
})
export class VoiceSelector {
  readonly synthesis = speechSynthesis();
  readonly selectedVoice = signal('');
  
  speak() {
    const voice = this.synthesis.voices().find(v => v.voiceURI === this.selectedVoice());
    this.synthesis.speak('Hello, world!', { voice }); // [!code highlight]
  }
}
```

### Pause and resume

```angular-ts
import { Component } from '@angular/core';
import { speechSynthesis } from '@signality/core';

@Component({
  template: `
    <button (click)="synthesis.speak('This is a long text that can be paused')">
      Start
    </button>
    <button (click)="synthesis.pause()" [disabled]="!synthesis.isSpeaking() || synthesis.isPaused()">
      Pause
    </button>
    <button (click)="synthesis.resume()" [disabled]="!synthesis.isPaused()">
      Resume
    </button>
    <button (click)="synthesis.stop()" [disabled]="!synthesis.isSpeaking()">
      Stop
    </button>
  `,
})
export class PauseResume {
  readonly synthesis = speechSynthesis();
}
```

### Custom speech settings

```angular-ts
import { Component } from '@angular/core';
import { speechSynthesis } from '@signality/core';

@Component({
  template: `
    <input [value]="text()" (input)="text.set($any($event.target).value)" />
    <button (click)="speakWithSettings()">Speak</button>
  `,
})
export class CustomSettings {
  readonly synthesis = speechSynthesis();
  readonly text = signal('Hello, world!');
  
  speakWithSettings() {
    this.synthesis.speak(this.text(), {
      lang: 'en-US', // [!code highlight]
      rate: 1.5, // [!code highlight]
      pitch: 1.2, // [!code highlight]
      volume: 0.8, // [!code highlight]
    });
  }
}
```

## Browser Compatibility

The Speech Synthesis API has limited browser support. Always check `isSupported()` before using text-to-speech (see [Browser API support detection](/guide/key-concepts#browser-api-support-detection)):

```angular-html
@if (synthesis.isSupported()) {
  <button (click)="synthesis.speak(text())">Speak</button>
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
  readonly lang?: string;
  readonly rate?: number;
  readonly pitch?: number;
  readonly volume?: number;
  readonly voice?: SpeechSynthesisVoice;
}

interface SpeechSynthesisSpeakOptions {
  readonly text: string;
  readonly lang?: string;
  readonly rate?: number;
  readonly pitch?: number;
  readonly volume?: number;
  readonly voice?: SpeechSynthesisVoice;
}

interface SpeechSynthesisRef {
  readonly isSupported: Signal<boolean>;
  readonly isSpeaking: Signal<boolean>;
  readonly isPaused: Signal<boolean>;
  readonly voices: Signal<SpeechSynthesisVoice[]>;
  readonly currentText: Signal<string>;
  readonly speak: (text: string, options?: Partial<SpeechSynthesisSpeakOptions>) => void;
  readonly stop: () => void;
  readonly pause: () => void;
  readonly resume: () => void;
}

function speechSynthesis(options?: SpeechSynthesisOptions): SpeechSynthesisRef;
```

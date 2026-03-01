---
source: https://github.com/signalityjs/signality/blob/main/projects/core/browser/speech-recognition/index.ts
---

# SpeechRecognition

Reactive wrapper around the [Speech Recognition API](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition). Convert speech to text with Angular signals.

<Demo name="speech-recognition" />

## Usage

```angular-ts
import { Component } from '@angular/core';
import { speechRecognition } from '@signality/core';

@Component({
  template: `
    <button 
      (click)="recognition.start()" 
      [disabled]="recognition.isListening()"
    >
      Start Listening
    </button>
    
    <button 
      (click)="recognition.stop()" 
      [disabled]="!recognition.isListening()"
    >
      Stop
    </button>
    
    <p>Text: {{ recognition.text() }}</p>
    
    @if (recognition.interimText()) {
      <p class="interim">{{ recognition.interimText() }}</p>
    }
  `,
})
export class VoiceInput {
  readonly recognition = speechRecognition(); // [!code highlight]
}
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `options` | `SpeechRecognitionOptions` | Optional configuration (see [Options](#options) below) |

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `lang` | `string` | `'en-US'` | Language for speech recognition |
| `interimResults` | `boolean` | `false` | Whether to return interim results |
| `continuous` | `boolean` | `false` | Whether to continue recognition after speech ends |
| `maxAlternatives` | `number` | `1` | Maximum number of alternative transcripts |
| `injector` | [`Injector`](https://angular.dev/api/core/Injector) | - | Optional injector for DI context |

## Return Value

The `speechRecognition()` function returns a `SpeechRecognitionRef`:

| Property | Type | Description |
|----------|------|-------------|
| `isSupported` | `Signal<boolean>` | Whether Speech Recognition API is supported |
| `isListening` | `Signal<boolean>` | Whether recognition is currently active |
| `text` | `Signal<string>` | Final transcript text |
| `interimText` | `Signal<string>` | Interim transcript text |
| `error` | `Signal<string \| null>` | Error message if recognition failed |
| `start` | `() => void` | Start speech recognition |
| `stop` | `() => void` | Stop speech recognition |
| `abort` | `() => void` | Abort speech recognition |

## Examples

### Voice search

```angular-ts
import { Component, effect } from '@angular/core';
import { speechRecognition } from '@signality/core';

@Component({
  template: `
    <button (click)="toggleListening()">
      {{ recognition.isListening() ? 'Stop' : 'Start' }} Listening
    </button>
    <input [(ngModel)]="searchQuery" />
  `,
})
export class VoiceSearch {
  readonly recognition = speechRecognition({ continuous: true }); // [!code highlight]
  readonly searchQuery = signal('');
  
  constructor() {
    effect(() => {
      const text = this.recognition.text();
      if (text) {
        this.searchQuery.set(text);
      }
    });
  }
  
  toggleListening() {
    if (this.recognition.isListening()) {
      this.recognition.stop();
    } else {
      this.recognition.start();
    }
  }
}
```

### Real-time transcription

```angular-ts
import { Component } from '@angular/core';
import { speechRecognition } from '@signality/core';

@Component({
  template: `
    <div class="transcription">
      <p class="final">{{ recognition.text() }}</p>
      @if (recognition.interimText()) {
        <p class="interim">{{ recognition.interimText() }}</p>
      }
    </div>
  `,
})
export class Transcription {
  readonly recognition = speechRecognition({
    interimResults: true, // [!code highlight]
    continuous: true,
  });
  
  constructor() {
    this.recognition.start();
  }
}
```

### Error handling

```angular-ts
import { Component } from '@angular/core';
import { speechRecognition } from '@signality/core';

@Component({
  template: `
    @if (recognition.error()) {
      <div class="error">{{ recognition.error() }}</div>
    }
    <button (click)="recognition.start()">Try Again</button>
  `,
})
export class ErrorHandling {
  readonly recognition = speechRecognition();
}
```

## Browser Compatibility

The Speech Recognition API has limited browser support. Always check `isSupported()` before using speech recognition (see [Browser API support detection](/guide/key-concepts#browser-api-support-detection)):

```angular-html
@if (recognition.isSupported()) {
  <button (click)="recognition.start()">Start Listening</button>
} @else {
  <p>Speech recognition is not available in this browser</p>
}
```

For detailed browser support information, see [Can I use: Speech Recognition API](https://caniuse.com/speech-recognition).

## SSR Compatibility

On the server, signals initialize with safe defaults:

- `isSupported` → `false`
- `isListening` → `false`
- `text` → `''`
- `interimText` → `''`
- `error` → `null`
- `start`, `stop`, `abort` → no-op functions

## Type Definitions

```typescript
interface SpeechRecognitionOptions extends WithInjector {
  readonly lang?: string;
  readonly interimResults?: boolean;
  readonly continuous?: boolean;
  readonly maxAlternatives?: number;
}

interface SpeechRecognitionRef {
  readonly isSupported: Signal<boolean>;
  readonly isListening: Signal<boolean>;
  readonly text: Signal<string>;
  readonly interimText: Signal<string>;
  readonly error: Signal<string | null>;
  readonly start: () => void;
  readonly stop: () => void;
  readonly abort: () => void;
}

function speechRecognition(options?: SpeechRecognitionOptions): SpeechRecognitionRef;
```

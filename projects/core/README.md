# @signality/core

A collection of atomic utilities for building reactive compositions in [Angular](https://angular.dev).

## Key Benefits

- **Signal-first design** — built on top of Angular [Signals](https://angular.dev/guide/signals), abstracting away from RxJS
- **Automatic cleanup** — utilities manage resource lifecycles automatically
- **SSR-compatible** — browser APIs are guarded with safe defaults on the server
- **Reactive inputs** — seamlessly handles static and reactive values
- **Tree-Shakable** — only the code you use ends up in your bundle

## Quick Example

```ts
import { Component, effect } from '@angular/core';
import { storage, speechSynthesis, favicon } from '@signality/core';

@Component({
  template: `
    <input [(ngModel)]="value" />
    <button (click)="synthesis.speak(value())">Speak</button>
  `,
})
export class Demo {
  readonly value = storage('key', ''); // Web Storage API
  readonly synthesis = speechSynthesis(); // Web Speech API
  readonly fav = favicon(); // Dynamic Favicon

  constructor() {
    effect(() => {
      if (this.synthesis.isSpeaking()) {
        this.fav.setEmoji('🔊');
      } else {
        this.fav.reset();
      }
    });
  }
}
```

## Framework Compatibility

| Tool        | Minimum Version |
|-------------|-----------------|
| **Angular** | `v20.0.0`       |

## Installation

```bash
pnpm add @signality/core
```

Or with npm/yarn:

```bash
npm install @signality/core
# or
yarn add @signality/core
```

## Documentation

Full documentation available at [signality.dev](https://signality.dev)

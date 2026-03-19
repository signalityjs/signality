<p align="center">
  <img src="logo.svg" alt="Signality logo" width="100px" height="100px"/>
  <br>
</p>

<p align="center">
  <a href="https://signality.dev"><strong>signality.dev</strong></a>
  <br>
</p>

<p align="center">
  <a href="CONTRIBUTING.md">Contributing Guidelines</a>
  ·
  <a href="https://github.com/signalityjs/signality/issues">Submit an Issue</a>
  <br>
  <br>
</p>

<p align="center">
  <a href="https://www.npmjs.com/@angular/core">
    <img src="https://img.shields.io/npm/v/@angular/core.svg?logo=npm&logoColor=fff&label=NPM+package&color=limegreen" alt="Angular on npm" />
  </a>
</p>

<hr>

A collection of atomic utilities for building reactive compositions in [Angular](https://angular.dev).

## Overview

**Key Features:**

- **Signal-first design** — built on top of Angular [Signals](https://angular.dev/guide/signals), abstracting away from RxJS
- **Automatic cleanup** — utilities manage resource lifecycles automatically
- **SSR-compatible** — browser APIs are guarded with safe defaults on the server
- **Reactive inputs** — seamlessly handles static and reactive values
- **Tree-Shakable** — only the code you use ends up in your bundle

## Framework Compatibility

Signality requires the following minimum versions:

| Tool        | Minimum Version |
|-------------|-----------------|
| **Angular** | `v19.2.0`       |

## Installation

### 📦 Core Package

`@signality/core` is the main package containing browser utilities, element utilities, and general-purpose reactive helpers:

```bash
pnpm add @signality/core
```

Or with npm/yarn:

```bash
npm install @signality/core
# or
yarn add @signality/core
```

### 🔌 Additional Packages

Signality also provides specialized integration packages:

#### CDK Integration

Signal-based utilities for Angular CDK:

```bash
pnpm add @signality/cdk-interop
```

**Note:** `@signality/cdk-interop` requires both `@signality/core` and `@angular/cdk` as peer dependencies.

## Usage

Read the full documentation here: <a href="https://signality.dev" rel="noopener noreferrer">https://signality.dev</a>

### Quick Example

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

## Packages

| Package                                                                          | Description                                                                                     |
|----------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------|
| [`@signality/core`](https://www.npmjs.com/package/@signality/core)               | Core utilities: browser APIs, element utilities, reactive helpers, router and forms integration |
| [`@signality/cdk-interop`](https://www.npmjs.com/package/@signality/cdk-interop) | CDK integration: focus monitoring, interactivity checking, and input modality detection         |

## Releases

For changelog, refer to the [automatically generated changelog](/CHANGELOG.md).

---

## Development

This section is for contributors and developers who want to work on Signality.

### Development Environment

The following tools are required for local development:

| Tool        | Minimum Version | Notes                                      |
|-------------|-----------------|--------------------------------------------|
| **Node.js** | `v20.19.0`      | Aligns with active LTS versions used in CI |
| **npm**     | Not supported   | ❌ Please use **pnpm** instead (see below)  |
| **pnpm**    | `v9.12.0`       | ✅ Preferred package manager                |

### Contributing

Please follow our [contributing guidelines](/CONTRIBUTING.md).

## License

Licensed under the [MIT](/LICENSE) License, Copyright © 2025-present.

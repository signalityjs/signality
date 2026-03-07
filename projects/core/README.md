# @signality/core

Signal-first utility collection for Angular. Comprehensive library of reactive utilities for browser APIs, DOM elements, and common patterns.

## Installation

```bash
npm install @signality/core
```

## Features

### Browser Utilities
- **`battery()`** — Reactive battery status and charging state
- **`clipboard()`** — Reactive clipboard read/write operations
- **`geolocation()`** — Reactive geolocation tracking
- **`pageVisibility()`** — Reactive page visibility state
- **`storage()`** — Reactive localStorage/sessionStorage with sync
- **`network()`** — Reactive network connection status
- **`fullscreen()`** — Reactive fullscreen API
- And [many more...](https://signality.dev/browser/battery)

### Element Utilities
- **`elementSize()`** — Reactive element dimensions
- **`elementVisibility()`** — Reactive Intersection Observer
- **`dropzone()`** — Reactive drag & drop zone
- **`windowSize()`** — Reactive window dimensions
- **`scrollPosition()`** — Reactive scroll position
- And [many more...](https://signality.dev/elements/active-element)

### Utils
- **`debounced()`** — Debounced writable signal
- **`throttled()`** — Throttled writable signal

## Usage

```typescript
import { battery, clipboard, elementSize, debounced } from '@signality/core';

// Battery status
const batteryStatus = battery();
// batteryStatus.level(), batteryStatus.charging()

// Clipboard operations
const clipboard = clipboard();
await clipboard.copy('Hello');
const text = await clipboard.paste();

// Element size tracking
const element = viewChild<ElementRef<HTMLDivElement>>('myElement');
const size = elementSize(element);
// size.width(), size.height()

// Debounced signal
const searchQuery = debounced('', 300);
```

## Documentation

Full documentation available at [signality.dev](https://signality.dev)

# @signality/cdk-interop

Signal-based utilities for Angular CDK. Reactive wrappers around CDK's accessibility features.

## Installation

```bash
npm install @signality/cdk-interop @angular/cdk
```

## Features

- **`focusMonitor()`** — Reactive focus tracking with origin detection (keyboard, mouse, touch, program)
- **`inputModality()`** — Reactive input method detection (keyboard, mouse, touch)
- **`liveAnnouncer()`** — Reactive screen reader announcements with message tracking

## Usage

```typescript
import { focusMonitor, inputModality, liveAnnouncer } from '@signality/cdk-interop';

// Focus monitoring with origin
const btn = viewChild<ElementRef<HTMLButtonElement>>('btn');
const focus = focusMonitor(btn);
// In template: Focused: {{ focus.isFocused() }}, Origin: {{ focus.origin() }}

// Input modality detection
const modality = inputModality();
// In template: Current input: {{ modality() ?? 'none' }}

// Screen reader announcements
const announcer = liveAnnouncer();
announcer.announce('Item added to cart');
// In template: Last: {{ announcer.lastMessage() }}
```

## Documentation

Full documentation available at [signality.dev/cdk-interop](https://signality.dev/cdk-interop/focus-monitor)


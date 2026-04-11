## 0.2.0 (2026-04-11)

### 🚀 Features

- **core:** `listener` add MediaQueryListEvent overload ([#124](https://github.com/signalityjs/signality/pull/124))
- ⚠️  **core:** change utilities error handling to propagate errors by default ([#126](https://github.com/signalityjs/signality/pull/126))
- **core:** `cva` replace generic CvaOptions type with explicit interface for better readability ([#128](https://github.com/signalityjs/signality/pull/128))
- ⚠️  **core:** `webNotification` simplify api by removing return values ([#137](https://github.com/signalityjs/signality/pull/137))
- **core:** `devicePixelRatio` add new utility ([#141](https://github.com/signalityjs/signality/pull/141))

### 🩹 Fixes

- **core:** `cva` prevent errors when required signal accessed ([#130](https://github.com/signalityjs/signality/pull/130))
- **core:** `webNotification` sync permission with browser permission changes ([#139](https://github.com/signalityjs/signality/pull/139))

### ⚠️  Breaking Changes

- **core:** `requestPermission()` now returns Promise<void> instead of
- **core:** utilities no longer catch and log errors internally"

## 0.1.3 (2026-04-05)

### 🚀 Features

- **core:** `generateId` add new utility for creating unique IDs ([#108](https://github.com/signalityjs/signality/pull/108))
- **core:** `textSelection` add root option to track selections only within a specific element ([#110](https://github.com/signalityjs/signality/pull/110))

### 🩹 Fixes

- **core:** `storage` dispatch storage event to sync signals with same key in same session ([#115](https://github.com/signalityjs/signality/pull/115))

## 0.1.2 (2026-03-28)

### 🚀 Features

- **core:** `elementFocus` add writable focus control ([#100](https://github.com/signalityjs/signality/pull/100))

### 🩹 Fixes

- **core:** `elementVisibility` properly reset visibility signal on element disconnect ([#93](https://github.com/signalityjs/signality/pull/93))
- **core:** `favicon` exclude apple-touch-icon from favicon selection ([#95](https://github.com/signalityjs/signality/pull/95))
- **core:** `elementSize` properly reset size signal on element disconnect ([#98](https://github.com/signalityjs/signality/pull/98))

## 0.1.1 (2026-03-20)

### 🩹 Fixes

- **core:** ensure bluetooth and speech-recognition types work without `skipLibCheck` ([#72](https://github.com/signalityjs/signality/pull/72))
- **core:** `pictureInPicture.enter()` assert element and propagate errors to caller ([#75](https://github.com/signalityjs/signality/pull/75))

## 0.1.0 (2026-03-20)

This was a version bump only, there were no code changes.

## 0.0.1-alpha.4 (2026-03-19)

This was a version bump only, there were no code changes.

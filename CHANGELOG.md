## 0.5.0 (2026-08-23)

### 🚀 Features

- **core:** `battery` add injection token for singleton usage ([#206](https://github.com/signalityjs/signality/pull/206))
- **core:** `devicePosture` add injection token for singleton usage ([#208](https://github.com/signalityjs/signality/pull/208))
- **core:** `gamepad` add injection token for singleton usage ([#210](https://github.com/signalityjs/signality/pull/210))
- **core:** `onKey` now supports chainable modifiers ([#213](https://github.com/signalityjs/signality/pull/213))
- **core:** `throttleCallback` add `leading` and `trailing` options ([#217](https://github.com/signalityjs/signality/pull/217))
- **core:** `throttled` add `leading` and `trailing` options ([#219](https://github.com/signalityjs/signality/pull/219))
- **core:** `broadcastChannel` now supports signal options for the `data` signal ([#225](https://github.com/signalityjs/signality/pull/225))
- ⚠️  **core:** `windowSize` expose `width` and `height` as separate signals ([#243](https://github.com/signalityjs/signality/pull/243))

### 🩹 Fixes

- **core:** `listener` preserve modifier chain when a modifier is repeated ([#215](https://github.com/signalityjs/signality/pull/215))
- **core:** `permissionState` correctly sync initial state from the resolved query ([#221](https://github.com/signalityjs/signality/pull/221))
- **core:** `resizeObserver` prevent observation from resuming after `destroy()` ([#223](https://github.com/signalityjs/signality/pull/223))
- **core:** `fullscreen` correctly sync initial state from the DOM ([#227](https://github.com/signalityjs/signality/pull/227))
- **core:** `onClickOutside` ignore clicks while the target is absent ([#230](https://github.com/signalityjs/signality/pull/230))
- **core:** `activeElement` cancel the deferred shadow focusout sync on destroy ([#232](https://github.com/signalityjs/signality/pull/232))
- **core:** `battery` handle a rejected `getBattery()` query ([#234](https://github.com/signalityjs/signality/pull/234))
- **core:** `scrollPosition` measure after the target is rendered ([#236](https://github.com/signalityjs/signality/pull/236))
- **core:** `favicon` include every icon link in favicon updates ([#238](https://github.com/signalityjs/signality/pull/238))
- **core:** `fps` clamp `sampleSize` to at least one frame ([#240](https://github.com/signalityjs/signality/pull/240))

### ⚠️  Breaking Changes

- ⚠️  **core:** `windowSize` expose `width` and `height` as separate signals ([#243](https://github.com/signalityjs/signality/pull/243))

## 0.4.0 (2026-08-04)

### 🚀 Features

- **core:** `onKey` add new utility for declarative keyboard event handling ([#201](https://github.com/signalityjs/signality/pull/201))
- **core:** `queryParams` is now a WritableSignal ([#202](https://github.com/signalityjs/signality/pull/202))

## 0.3.3 (2026-07-07)

### 🚀 Features

- **core:** `listener` add BroadcastChannelEventMap overload ([#195](https://github.com/signalityjs/signality/pull/195))

### 🩹 Fixes

- **core:** `storage` use CustomEvent for same-document sync ([#198](https://github.com/signalityjs/signality/pull/198))

## 0.3.2 (2026-05-23)

### 🩹 Fixes

- **core:** `battery` prevent error when host is destroyed during initialization ([#188](https://github.com/signalityjs/signality/pull/188))
- **core:** `bluetooth` prevent error when host is destroyed during request ([#190](https://github.com/signalityjs/signality/pull/190))
- **core:** `displayMedia` prevent stream leak when host is destroyed during start ([#192](https://github.com/signalityjs/signality/pull/192))

## 0.3.1 (2026-05-09)

### 🩹 Fixes

- **core:** `createInjectable` export utility types to support declaration file generation ([#171](https://github.com/signalityjs/signality/pull/171))
- **core:** `elementFocus` add assertion for null/undefined reactive target on signal set/update ([#177](https://github.com/signalityjs/signality/pull/177))
- **core:** `textDirection` add assertion for null/undefined reactive target on signal set/update ([#179](https://github.com/signalityjs/signality/pull/179))
- **core:** `fragment` correctly apply signal options (e.g. debugName) ([#181](https://github.com/signalityjs/signality/pull/181))
- **core:** `proxySignal` prevent value corruption in update without set handler ([#183](https://github.com/signalityjs/signality/pull/183))

## 0.3.0 (2026-04-27)

### 🚀 Features

- **core:** `createInjectable` add new utility ([#152](https://github.com/signalityjs/signality/pull/152))
- **core:** `fragment` is now a WritableSignal ([#160](https://github.com/signalityjs/signality/pull/160))
- **core:** `proxySignal` add new utility ([#166](https://github.com/signalityjs/signality/pull/166))

### 🩹 Fixes

- **core:** `textDirection` correctly sync initial state from the DOM for reactive targets ([#167](https://github.com/signalityjs/signality/pull/167))

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

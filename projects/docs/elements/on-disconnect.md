---
source: https://github.com/signalityjs/signality/blob/main/projects/core/elements/on-disconnect/index.ts
---

# OnDisconnect

Executes a callback when an element is disconnected from the DOM.

## Usage

```angular-ts
import { Component, viewChild, ElementRef } from '@angular/core';
import { onDisconnect } from '@signality/core';

@Component({
  template: `<div #el>Content</div>`,
})
export class OnDisconnectDemo {
  readonly el = viewChild<ElementRef>('el');

  constructor() {
    onDisconnect(this.el, () => {
      console.log('Element disconnected from DOM');
    });
  }
}
```

## Parameters

| Parameter  | Type                    | Description                                            |
|------------|-------------------------|--------------------------------------------------------|
| `target`   | `MaybeElementSignal<T>` | Element to watch for disconnection                     |
| `callback` | `(element: T) => void`  | Callback executed when element disconnects             |
| `options`  | `OnDisconnectOptions`   | Optional configuration (see [Options](#options) below) |

## Return Value

Returns an `OnDisconnectRef` object:

| Property  | Type         | Description                      |
|-----------|--------------|----------------------------------|
| `destroy` | `() => void` | Stops watching for disconnection |

## Options

The `WithInjector` interface provides:

| Option     | Type       | Description                      |
|------------|------------|----------------------------------|
| `injector` | `Injector` | Optional injector for DI context |

## SSR Compatibility

On the server, `onDisconnect` returns a no-op reference. The callback will never execute during server-side rendering.

## Type Definitions

```typescript
export interface OnDisconnectRef {
  readonly destroy: () => void;
}

export type OnDisconnectOptions = WithInjector;

export function onDisconnect<T extends Element>(
  target: MaybeElementSignal<T>,
  callback: (element: T) => void,
  options?: OnDisconnectOptions
): OnDisconnectRef;
```

---
source: https://github.com/signalityjs/signality/blob/main/projects/core/browser/listener/index.ts
---

# Listener

Reactive event listener with automatic cleanup. Attach event handlers to DOM elements, `window`, or `document` with automatic removal on component destroy.

::: warning Prefer Angular's built-in [event listeners](https://angular.dev/guide/templates/event-listeners)
For most event handling scenarios, Angular's built-in event binding syntax is recommended:

- **Template event listeners**: use `(event)="handler()"` in component templates for declarative event handling
- **Host element events**: use the `host` property in the `@Component` decorator to listen to events on the host element

```angular-ts
@Component({
  template: `<button (click)="handleClick()">Click</button>`
})
export class MyComponent {
  handleClick() { /* ... */ }
}
```

:::

## Usage

```angular-ts
import { Component, viewChild, ElementRef } from '@angular/core';
import { listener } from '@signality/core';

@Component({
  template: `<button #btn>Click me</button>`,
})
export class ClickTracker {
  readonly btn = viewChild<ElementRef>('btn');
  
  constructor() {
    listener(this.btn, 'click', event => { // [!code highlight]
      console.log('Button clicked!', event);
    });
  }
}
```

::: tip When this can be useful
The `listener` utility is primarily designed for **internal composition** within other Signality utilities. However, it can be useful in application code in the following scenarios:

1. **[Event modifiers](#modifiers) not available in templates**: When you need declarative modifiers like `capture`, `passive`, `once`, `stop`, `prevent`, or `self` that aren't supported by Angular's template syntax:

```angular-ts
// passive listener for better performance
listener.passive(window, 'wheel', () => {
  // smooth scrolling without blocking
});

// capture phase listener + once option
listener.capture.once(element, 'click', () => {
  // handles click in capture phase and once
});
```

2. **Dynamic event names**: When the event name itself is reactive and changes over time:

```angular-ts
const eventType = signal<'click' | 'mouseenter'>('click');
listener(element, eventType, handler); // re-attaches when eventType changes
```

3. **Manual lifecycle management**: When you need to optimize performance by conditionally registering listeners or destroying them when they're no longer needed:

```angular-ts
let listenerRef: ListenerRef | null = null;

startListening() {
  // register listener only when needed
  listenerRef = listener(window, 'resize', handleResize);
}

stopListening() {
  // destroy listener when not needed
  listenerRef?.destroy();
  listenerRef = null;
}
```

:::

## Parameters

| Parameter | Type                                                                              | Description                                            |
|-----------|-----------------------------------------------------------------------------------|--------------------------------------------------------|
| `target`  | [`MaybeElementSignal<T>`](/reference/utility-types#maybeelementsignal-lt-type-gt) | Target element, `window`, or `document`                |
| `event`   | [`MaybeSignal<string>`](/reference/utility-types#maybesignal-lt-type-gt)          | Event name to listener for                             |
| `handler` | `(event) => void`                                                                 | Event handler function                                 |
| `options` | `ListenerOptions`                                                                 | Optional configuration (see [Options](#options) below) |

## Options

The `ListenerOptions` extends `WithInjector`:

| Option     | Type                                                | Description                      |
|------------|-----------------------------------------------------|----------------------------------|
| `injector` | [`Injector`](https://angular.dev/api/core/Injector) | Optional injector for DI context |

All other configuration (capture, passive, once, stop, prevent, self) is done through [modifiers](#modifiers).

## Modifiers

Event listener configuration is done through modifiers:

```angular-ts
// Use modifiers for configuration:
listener.capture.passive(element, 'click', handler);
```

Available modifiers:

- `listener.capture(...)` - equivalent to `{ capture: true }`
- `listener.passive(...)` - equivalent to `{ passive: true }`
- `listener.once(...)` - equivalent to `{ once: true }`
- `listener.stop(...)` - calls `event.stopPropagation()`
- `listener.prevent(...)` - calls `event.preventDefault()`
- `listener.self(...)` - only triggers if event originated from the element itself

Modifiers can be chained in any order:

```angular-ts
listener.capture.passive.once(element, 'wheel', handler);
listener.stop.prevent(element, 'submit', handler);
listener.self.stop(element, 'click', handler);
```

## Return Value

Returns a `ListenerRef` (alias for `EffectRef`) that can be used to manually destroy the listenerer.

## Examples

### Dynamic event name

```angular-ts
import { Component, signal, viewChild, ElementRef } from '@angular/core';
import { listener } from '@signality/core';

@Component({
  template: `
    <div #target>Hover or click me</div>
    <button (click)="toggleEvent()">Toggle event</button>
    <p>Event count: {{ count() }}</p>
  `,
})
export class DynamicEvent {
  readonly target = viewChild<ElementRef>('target');
  readonly eventName = signal<'click' | 'mouseenter'>('click'); // [!code highlight]
  readonly count = signal(0);
  
  constructor() {
    // re-attaches when eventName changes
    listener(this.target, this.eventName, () => { // [!code highlight]
      this.count.update(c => c + 1);
    });
  }
  
  toggleEvent() {
    this.eventName.update(e => e === 'click' ? 'mouseenter' : 'click');
  }
}
```

### Modifiers

```angular-ts
import { Component, viewChild, ElementRef } from '@angular/core';
import { listener } from '@signality/core';

@Component({
  template: `
    <form #form>
      <button type="submit">Submit</button>
    </form>
  `,
})
export class ModifiersExample {
  readonly form = viewChild<ElementRef>('form');
  
  constructor() {
    // stop event propagation
    listener.stop(this.form, 'click', e => {
      console.log('Form clicked, propagation stopped');
    });
    
    // prevent default and stop propagation
    listener.prevent.stop(this.form, 'submit', e => {
      console.log('Form submit prevented');
    });
    
    // only trigger if clicked directly on form (not children)
    listener.self(this.form, 'click', e => {
      console.log('Form itself was clicked');
    });
    
    // chain multiple modifiers
    listener.capture.passive.once(this.form, 'wheel', e => {
      console.log('Wheel captured once');
    });
  }
}
```

### Manual cleanup

Listeners are automatically unregistered after the view is destroyed (see [Automatic cleanup](/guide/key-concepts#automatic-cleanup)). However, you can also manually destroy them if needed:

```angular-ts
import { Component, viewChild, ElementRef, signal } from '@angular/core';
import { listener } from '@signality/core';

@Component({
  template: `
    <div #target>Move mouse here</div>
    <button (click)="stopTracking()">Stop tracking</button>
  `,
})
export class ManualCleanup {
  readonly target = viewChild<ElementRef>('target');
  readonly position = signal({ x: 0, y: 0 });
  
  readonly listener = listener(this.target, 'mousemove', e => {
    this.position.set({ x: e.clientX, y: e.clientY });
  });
  
  stopTracking() {
    this.listener.destroy(); // [!code highlight]
  }
}
```

## Type Definitions

```typescript
type ListenerOptions = WithInjector;

export interface ListenerRef {
  readonly destroy: () => void;
}

// Window events
function listener<E extends keyof WindowEventMap>(
  target: Window,
  event: MaybeSignal<E>,
  handler: (e: WindowEventMap[E]) => any,
  options?: ListenerOptions
): ListenerRef;

// Document events
function listener<E extends keyof DocumentEventMap>(
  target: Document,
  event: MaybeSignal<E>,
  handler: (e: DocumentEventMap[E]) => any,
  options?: ListenerOptions
): ListenerRef;

// Element events
function listener<T extends HTMLElement, E extends keyof HTMLElementEventMap>(
  target: MaybeElementSignal<T>,
  event: MaybeSignal<E>,
  handler: (e: HTMLElementEventMap[E]) => any,
  options?: ListenerOptions
): ListenerRef;

// Generic events
function listener<EventType = Event>(
  target: MaybeElementSignal<HTMLElement>,
  event: MaybeSignal<string>,
  handler: (e: EventType) => void,
  options?: ListenerOptions
): ListenerRef;
```

## Related

- [elementHover](/elements/element-hover) — Track hover state
- [elementFocus](/elements/element-focus) — Track focus state
- [mouse](/elements/mouse) — Track mouse position

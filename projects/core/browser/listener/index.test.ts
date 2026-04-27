import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { listener, setupSync } from './index';

function click(element: HTMLElement, options?: MouseEventInit): MouseEvent {
  const event = new MouseEvent('click', { bubbles: true, cancelable: true, ...options });
  element.dispatchEvent(event);
  return event;
}

describe(listener.name, () => {
  describe('reactive target (signal query)', () => {
    @Component({ template: '<button #btn>Click me</button>' })
    class HostComponent {
      clickCount = 0;
      readonly btn = viewChild<ElementRef<HTMLButtonElement>>('btn');

      constructor() {
        listener(this.btn, 'click', () => this.clickCount++);
      }
    }

    function setup() {
      const fixture = TestBed.createComponent(HostComponent);
      fixture.detectChanges();

      return {
        component: fixture.componentInstance,
        button: fixture.nativeElement.querySelector('button') as HTMLButtonElement,
      };
    }

    it('attaches the event listener', () => {
      const { component, button } = setup();

      click(button);

      expect(component.clickCount).toBe(1);
    });

    it('handles repeated events', () => {
      const { component, button } = setup();
      const CLICK_COUNT = 3;

      for (let i = 0; i < CLICK_COUNT; i++) {
        click(button);
      }

      expect(component.clickCount).toBe(CLICK_COUNT);
    });
  });

  describe('non-reactive target (injected ElementRef)', () => {
    @Component({ template: '<button>Click me</button>' })
    class HostComponent {
      clickCount = 0;

      constructor() {
        listener(inject(ElementRef), 'click', () => this.clickCount++);
      }
    }

    function setup() {
      const fixture = TestBed.createComponent(HostComponent);
      fixture.detectChanges();

      return {
        component: fixture.componentInstance,
        host: fixture.nativeElement as HTMLElement,
      };
    }

    it('attaches the event listener to the host element', () => {
      const { component, host } = setup();

      click(host);

      expect(component.clickCount).toBe(1);
    });
  });

  describe('window target', () => {
    @Component({ template: '' })
    class HostComponent {
      resizeCount = 0;

      constructor() {
        listener(window, 'resize', () => this.resizeCount++);
      }
    }

    function setup() {
      const fixture = TestBed.createComponent(HostComponent);
      fixture.detectChanges();
      return { component: fixture.componentInstance };
    }

    it('attaches the event listener to window', () => {
      const { component } = setup();

      window.dispatchEvent(new Event('resize'));

      expect(component.resizeCount).toBe(1);
    });
  });

  describe('document target', () => {
    @Component({ template: '' })
    class HostComponent {
      clickCount = 0;

      constructor() {
        listener(document, 'click', () => this.clickCount++);
      }
    }

    function setup() {
      const fixture = TestBed.createComponent(HostComponent);
      fixture.detectChanges();
      return { component: fixture.componentInstance };
    }

    it('attaches the event listener to document', () => {
      const { component } = setup();

      click(document.documentElement);

      expect(component.clickCount).toBe(1);
    });
  });

  describe('modifier: capture', () => {
    @Component({ template: '<div #parent><button #child>Click</button></div>' })
    class HostComponent {
      readonly parent = viewChild<ElementRef<HTMLDivElement>>('parent');
      readonly child = viewChild<ElementRef<HTMLButtonElement>>('child');
      events: string[] = [];

      constructor() {
        listener.capture(this.parent, 'click', () => this.events.push('parent-capture'));
        listener(this.child, 'click', () => this.events.push('child-bubble'));
      }
    }

    function setup() {
      const fixture = TestBed.createComponent(HostComponent);
      fixture.detectChanges();

      return {
        component: fixture.componentInstance,
        button: fixture.nativeElement.querySelector('button') as HTMLButtonElement,
      };
    }

    it('fires the capture listener before the bubble listener', () => {
      const { component, button } = setup();

      click(button);

      expect(component.events).toEqual(['parent-capture', 'child-bubble']);
    });
  });

  describe('modifier: prevent', () => {
    @Component({ template: '<a #link href="#test">Link</a>' })
    class HostComponent {
      readonly link = viewChild<ElementRef<HTMLAnchorElement>>('link');

      constructor() {
        listener.prevent(this.link, 'click', () => {
          /* empty */
        });
      }
    }

    function setup() {
      const fixture = TestBed.createComponent(HostComponent);
      fixture.detectChanges();

      return {
        anchor: fixture.nativeElement.querySelector('a') as HTMLAnchorElement,
      };
    }

    it('prevents the default browser action', () => {
      const { anchor } = setup();

      const event = click(anchor);

      expect(event.defaultPrevented).toBe(true);
    });
  });

  describe('modifier: stop', () => {
    @Component({ template: '<div #parent><button #child>Click</button></div>' })
    class HostComponent {
      readonly parent = viewChild<ElementRef<HTMLDivElement>>('parent');
      readonly child = viewChild<ElementRef<HTMLButtonElement>>('child');
      childClicked = false;
      parentClicked = false;

      constructor() {
        listener.stop(this.child, 'click', () => (this.childClicked = true));
        listener(this.parent, 'click', () => (this.parentClicked = true));
      }
    }

    function setup() {
      const fixture = TestBed.createComponent(HostComponent);
      fixture.detectChanges();

      return {
        component: fixture.componentInstance,
        button: fixture.nativeElement.querySelector('button') as HTMLButtonElement,
        parentEl: fixture.nativeElement.querySelector('div') as HTMLDivElement,
      };
    }

    it('still invokes the handler on the target element', () => {
      const { component, button } = setup();

      click(button);

      expect(component.childClicked).toBe(true);
    });

    it('stops the event from bubbling to ancestor listeners', () => {
      const { component, button } = setup();

      click(button);

      expect(component.parentClicked).toBe(false);
    });
  });

  describe('modifier: self', () => {
    @Component({ template: '<div #parent><button #child>Click</button></div>' })
    class HostComponent {
      readonly parent = viewChild<ElementRef<HTMLDivElement>>('parent');
      parentClickCount = 0;

      constructor() {
        listener.self(this.parent, 'click', () => this.parentClickCount++);
      }
    }

    function setup() {
      const fixture = TestBed.createComponent(HostComponent);
      fixture.detectChanges();

      return {
        component: fixture.componentInstance,
        parentEl: fixture.nativeElement.querySelector('div') as HTMLDivElement,
        button: fixture.nativeElement.querySelector('button') as HTMLButtonElement,
      };
    }

    it('does not trigger when the event originates from a child element', () => {
      const { component, button } = setup();

      click(button);

      expect(component.parentClickCount).toBe(0);
    });

    it('triggers when the event originates from the element itself', () => {
      const { component, parentEl } = setup();

      click(parentEl);

      expect(component.parentClickCount).toBe(1);
    });
  });

  describe('modifier: once', () => {
    @Component({ template: '<button #btn>Click me</button>' })
    class HostComponent {
      readonly btn = viewChild<ElementRef<HTMLButtonElement>>('btn');
      clickCount = 0;

      constructor() {
        listener.once(this.btn, 'click', () => this.clickCount++);
      }
    }

    function setup() {
      const fixture = TestBed.createComponent(HostComponent);
      fixture.detectChanges();

      return {
        component: fixture.componentInstance,
        button: fixture.nativeElement.querySelector('button') as HTMLButtonElement,
      };
    }

    it('invokes the handler only on the first event', () => {
      const { component, button } = setup();

      click(button);
      click(button);
      click(button);

      expect(component.clickCount).toBe(1);
    });
  });

  describe('combined modifiers (prevent + stop)', () => {
    @Component({ template: '<div #parent><a #link href="#test">Link</a></div>' })
    class HostComponent {
      readonly link = viewChild<ElementRef<HTMLAnchorElement>>('link');
      readonly parent = viewChild<ElementRef<HTMLDivElement>>('parent');
      linkClicked = false;
      parentClicked = false;

      constructor() {
        listener.prevent.stop(this.link, 'click', () => (this.linkClicked = true));
        listener(this.parent, 'click', () => (this.parentClicked = true));
      }
    }

    function setup() {
      const fixture = TestBed.createComponent(HostComponent);
      fixture.detectChanges();

      return {
        component: fixture.componentInstance,
        anchor: fixture.nativeElement.querySelector('a') as HTMLAnchorElement,
      };
    }

    it('invokes the handler', () => {
      const { component, anchor } = setup();

      click(anchor);

      expect(component.linkClicked).toBe(true);
    });

    it('prevents the default browser action', () => {
      const { anchor } = setup();

      const event = click(anchor);

      expect(event.defaultPrevented).toBe(true);
    });

    it('stops the event from reaching ancestor listeners', () => {
      const { component, anchor } = setup();

      click(anchor);

      expect(component.parentClicked).toBe(false);
    });
  });

  describe('reactive event name', () => {
    @Component({ template: '<button #btn>Button</button>' })
    class HostComponent {
      eventCount = 0;
      readonly btn = viewChild<ElementRef<HTMLButtonElement>>('btn');
      readonly eventName = signal<'click' | 'dblclick'>('click');

      constructor() {
        listener(this.btn, this.eventName, () => this.eventCount++);
      }
    }

    function setup() {
      const fixture = TestBed.createComponent(HostComponent);
      fixture.detectChanges();

      return {
        component: fixture.componentInstance,
        button: fixture.nativeElement.querySelector('button') as HTMLButtonElement,
      };
    }

    it('listens to the initial event name', () => {
      const { component, button } = setup();

      click(button);

      expect(component.eventCount).toBe(1);
    });

    it('switches to the new event name after the signal changes', () => {
      const { component, button } = setup();

      component.eventName.set('dblclick');
      TestBed.tick();

      button.dispatchEvent(new MouseEvent('dblclick'));

      expect(component.eventCount).toBe(1);
    });

    it('removes the old event listener after the event name changes', () => {
      const { component, button } = setup();

      component.eventName.set('dblclick');
      TestBed.tick();

      // Firing the previous event name must no longer increment the counter
      click(button);

      expect(component.eventCount).toBe(0);
    });
  });

  describe('reactive target changes', () => {
    @Component({
      template: `
        @if (showButton()) {
        <button #btn>Click me</button>
        }
      `,
    })
    class HostComponent {
      clickCount = 0;
      readonly showButton = signal(true);
      readonly btn = viewChild<ElementRef<HTMLButtonElement>>('btn');
      readonly listener = listener(this.btn, 'click', () => this.clickCount++);
    }

    function setup() {
      const fixture = TestBed.createComponent(HostComponent);
      fixture.detectChanges();

      return {
        component: fixture.componentInstance,
        fixture,
        getButton: () => fixture.nativeElement.querySelector('button') as HTMLButtonElement | null,
      };
    }

    it('reattaches the listener when the target re-enters the DOM', () => {
      const { component, fixture, getButton } = setup();

      click(getButton()!);
      expect(component.clickCount).toBe(1);

      component.showButton.set(false);
      fixture.detectChanges();

      component.showButton.set(true);
      fixture.detectChanges();
      click(getButton()!);

      expect(component.clickCount).toBe(2);
    });

    it('stops receiving events when the target is removed from the DOM', () => {
      const { component, fixture, getButton } = setup();

      click(getButton()!);
      expect(component.clickCount).toBe(1);

      component.showButton.set(false);
      fixture.detectChanges();

      // No element to click; counter must remain unchanged
      expect(getButton()).toBeNull();
      expect(component.clickCount).toBe(1);
    });
  });

  describe('null / undefined target', () => {
    @Component({ template: '' })
    class HostComponent {
      clickCount = 0;
      readonly target = signal<ElementRef | null>(null);

      constructor() {
        listener(this.target, 'click', () => this.clickCount++);
      }
    }

    function setup() {
      const fixture = TestBed.createComponent(HostComponent);
      fixture.detectChanges();
      return { component: fixture.componentInstance };
    }

    it('does not throw when the target is null', () => {
      expect(() => setup()).not.toThrow();
    });

    it('does not invoke the handler when the target is null', () => {
      const { component } = setup();

      click(document.documentElement);

      expect(component.clickCount).toBe(0);
    });
  });

  describe('ListenerRef.destroy()', () => {
    @Component({ template: '<button #btn>Click me</button>' })
    class HostComponent {
      clickCount = 0;
      readonly btn = viewChild<ElementRef<HTMLButtonElement>>('btn');
      readonly listener = listener(this.btn, 'click', () => this.clickCount++);
    }

    function setup() {
      const fixture = TestBed.createComponent(HostComponent);
      fixture.detectChanges();

      return {
        component: fixture.componentInstance,
        button: fixture.nativeElement.querySelector('button') as HTMLButtonElement,
      };
    }

    it('stops the listener after destroy() is called', () => {
      const { component, button } = setup();

      click(button);
      expect(component.clickCount).toBe(1);

      component.listener.destroy();
      click(button);
      expect(component.clickCount).toBe(1);
    });

    it('calling destroy() multiple times does not throw', () => {
      const { component, button } = setup();

      click(button);
      expect(component.clickCount).toBe(1);
      expect(() => {
        component.listener.destroy();
        component.listener.destroy();
        component.listener.destroy();
      }).not.toThrow();

      click(button);
      expect(component.clickCount).toBe(1);
    });
  });

  describe('setupSync', () => {
    it('registers listener synchronously without render cycle', () => {
      let eventCount = 0;

      TestBed.runInInjectionContext(() => {
        setupSync(() => {
          listener(document, 'custom-event', () => eventCount++);
        });
      });

      document.dispatchEvent(new Event('custom-event'));

      expect(eventCount).toBe(1);
    });

    it('returns ListenerRef that can destroy the sync listener', () => {
      let eventCount = 0;

      const listenerRef = TestBed.runInInjectionContext(() => {
        return setupSync(() => listener(document, 'custom-event', () => eventCount++));
      });

      document.dispatchEvent(new Event('custom-event'));
      expect(eventCount).toBe(1);

      listenerRef.destroy();
      document.dispatchEvent(new Event('custom-event'));
      expect(eventCount).toBe(1);
    });

    it('without setupSync, listener is not registered synchronously', () => {
      let eventCount = 0;

      TestBed.runInInjectionContext(() => {
        listener(document, 'custom-event', () => eventCount++);
      });

      document.dispatchEvent(new Event('custom-event'));

      expect(eventCount).toBe(0);
    });
  });
});

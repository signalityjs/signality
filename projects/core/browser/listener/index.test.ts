import { Component, ElementRef, signal, viewChild, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { listener, setupSync } from './index';

describe(listener.name, () => {
  describe('with reactive target (signal query)', () => {
    @Component({
      template: '<button #btn>Click me</button>',
    })
    class TestComponent {
      readonly btn = viewChild<ElementRef>('btn');

      clickCount = 0;

      constructor() {
        listener(this.btn, 'click', () => {
          this.clickCount++;
        });
      }
    }

    function createComponent() {
      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      return {
        component: fixture.componentInstance,
        target: fixture.nativeElement.querySelector('button'),
      };
    }

    it('should attach event listener', () => {
      const { component, target } = createComponent();

      target.click();

      expect(component.clickCount).toBe(1);
    });

    it('should handle multiple events', () => {
      const { component, target } = createComponent();

      target.click();
      target.click();
      target.click();

      expect(component.clickCount).toBe(3);
    });
  });

  describe('with non-reactive target (ElementRef)', () => {
    @Component({
      template: '<button>Click me</button>',
    })
    class TestComponent {
      readonly elementRef = inject(ElementRef);
      clickCount = 0;

      constructor() {
        listener(this.elementRef, 'click', () => {
          this.clickCount++;
        });
      }
    }

    function setup() {
      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      return { cmp: fixture.componentInstance, element: fixture.nativeElement };
    }

    it('should attach event listener to host element', () => {
      const { cmp, element } = setup();

      element.click();

      expect(cmp.clickCount).toBe(1);
    });
  });

  describe('with window target (global object)', () => {
    @Component({ template: '' })
    class TestComponent {
      resizeCount = 0;

      constructor() {
        setupSync(() => {
          listener(window, 'resize', () => {
            this.resizeCount++;
          });
        });
      }
    }

    function setup() {
      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      return { cmp: fixture.componentInstance };
    }

    it('should attach event listener to window', () => {
      const { cmp } = setup();

      window.dispatchEvent(new Event('resize'));

      expect(cmp.resizeCount).toBe(1);
    });
  });

  describe('with document target (global object)', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      clickCount = 0;

      constructor() {
        setupSync(() => {
          listener(document, 'click', () => {
            this.clickCount++;
          });
        });
      }
    }

    function setup() {
      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      return { cmp: fixture.componentInstance };
    }

    it('should attach event listener to document', () => {
      const { cmp } = setup();

      document.dispatchEvent(new MouseEvent('click'));

      expect(cmp.clickCount).toBe(1);
    });
  });

  describe('modifiers', () => {
    describe('capture', () => {
      @Component({
        template: '<div #parent><button #child>Click</button></div>',
      })
      class TestComponent {
        readonly parent = viewChild<ElementRef>('parent');
        readonly child = viewChild<ElementRef>('child');
        events: string[] = [];

        constructor() {
          listener.capture(this.parent, 'click', () => {
            this.events.push('parent-capture');
          });
          listener(this.child, 'click', () => {
            this.events.push('child');
          });
        }
      }

      function setup() {
        const fixture = TestBed.createComponent(TestComponent);
        fixture.detectChanges();
        return {
          cmp: fixture.componentInstance,
          child: fixture.nativeElement.querySelector('button'),
        };
      }

      it('should execute capture listener first', () => {
        const { cmp, child } = setup();

        child.click();

        expect(cmp.events).toEqual(['parent-capture', 'child']);
      });
    });

    describe('prevent', () => {
      @Component({
        template: '<a #link href="#test">Link</a>',
      })
      class TestComponent {
        readonly link = viewChild<ElementRef>('link');
        defaultPrevented = false;

        constructor() {
          listener.prevent(this.link, 'click', e => {
            this.defaultPrevented = e.defaultPrevented;
          });
        }
      }

      function setup() {
        const fixture = TestBed.createComponent(TestComponent);
        fixture.detectChanges();
        return { cmp: fixture.componentInstance, link: fixture.nativeElement.querySelector('a') };
      }

      it('should prevent default action', () => {
        const { cmp, link } = setup();

        link.click();

        expect(cmp.defaultPrevented).toBe(true);
      });
    });

    describe('stop', () => {
      @Component({
        template: '<div #parent><button #child>Click</button></div>',
      })
      class TestComponent {
        readonly parent = viewChild<ElementRef>('parent');
        readonly child = viewChild<ElementRef>('child');

        parentClicked = false;

        constructor() {
          listener.stop(this.child, 'click', () => {
            /* empty */
          });
          listener(this.parent, 'click', () => {
            this.parentClicked = true;
          });
        }
      }

      function setup() {
        const fixture = TestBed.createComponent(TestComponent);
        fixture.detectChanges();
        return {
          cmp: fixture.componentInstance,
          child: fixture.nativeElement.querySelector('button'),
        };
      }

      it('should stop event propagation', () => {
        const { cmp, child } = setup();

        child.click();

        expect(cmp.parentClicked).toBe(false);
      });
    });

    describe('self', () => {
      @Component({
        template: '<div #parent><button #child>Click</button></div>',
      })
      class TestComponent {
        readonly parent = viewChild<ElementRef>('parent');
        parentClickCount = 0;

        constructor() {
          listener.self(this.parent, 'click', () => {
            this.parentClickCount++;
          });
        }
      }

      function setup() {
        const fixture = TestBed.createComponent(TestComponent);
        fixture.detectChanges();
        return {
          cmp: fixture.componentInstance,
          parent: fixture.nativeElement.querySelector('div'),
          child: fixture.nativeElement.querySelector('button'),
        };
      }

      it('should only trigger when event.target is element itself', () => {
        const { cmp, parent, child } = setup();

        child.click();
        expect(cmp.parentClickCount).toBe(0);

        parent.click();
        expect(cmp.parentClickCount).toBe(1);
      });
    });

    describe('combined modifiers', () => {
      @Component({
        template: '<div #parent><a #link href="#test">Link</a></div>',
      })
      class TestComponent {
        readonly link = viewChild<ElementRef>('link');
        readonly parent = viewChild<ElementRef>('parent');
        linkClicked = false;
        parentClicked = false;

        constructor() {
          listener.prevent.stop(this.link, 'click', () => {
            this.linkClicked = true;
          });
          listener(this.parent, 'click', () => {
            this.parentClicked = true;
          });
        }
      }

      function setup() {
        const fixture = TestBed.createComponent(TestComponent);
        fixture.detectChanges();
        return { cmp: fixture.componentInstance, link: fixture.nativeElement.querySelector('a') };
      }

      it('should apply multiple modifiers', () => {
        const { cmp, link } = setup();

        const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
        link.dispatchEvent(clickEvent);

        expect(cmp.linkClicked).toBe(true);
        expect(cmp.parentClicked).toBe(false);
        expect(clickEvent.defaultPrevented).toBe(true);
      });
    });
  });

  describe('reactive event name', () => {
    @Component({
      template: '<button #btn>Button</button>',
    })
    class TestComponent {
      readonly btn = viewChild<ElementRef>('btn');
      readonly eventName = signal<'click' | 'dblclick'>('click');
      eventCount = 0;

      constructor() {
        listener(this.btn, this.eventName, () => {
          this.eventCount++;
        });
      }
    }

    function setup() {
      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      return {
        cmp: fixture.componentInstance,
        element: fixture.nativeElement.querySelector('button'),
      };
    }

    it('should update listener when event name changes', () => {
      const { cmp, element } = setup();

      element.click();
      expect(cmp.eventCount).toBe(1);

      cmp.eventName.set('dblclick');
      TestBed.tick();
      element.click();

      expect(cmp.eventCount).toBe(1);

      element.dispatchEvent(new MouseEvent('dblclick'));

      expect(cmp.eventCount).toBe(2);
    });
  });

  describe('destroy', () => {
    @Component({
      template: '<button #btn>Click me</button>',
    })
    class TestComponent {
      readonly btn = viewChild<ElementRef>('btn');
      clickCount = 0;
      ref = listener(this.btn, 'click', () => {
        this.clickCount++;
      });
    }

    function setup() {
      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      return {
        cmp: fixture.componentInstance,
        element: fixture.nativeElement.querySelector('button'),
      };
    }

    it('should remove listener when destroyed', () => {
      const { cmp, element } = setup();

      element.click();
      expect(cmp.clickCount).toBe(1);

      cmp.ref.destroy();
      element.click();
      expect(cmp.clickCount).toBe(1);
    });
  });
});

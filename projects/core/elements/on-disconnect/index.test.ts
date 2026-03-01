import { afterNextRender, Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { onDisconnect } from './index';

describe(onDisconnect.name, () => {
  describe('with reactive target (signal query)', () => {
    @Component({
      template: `
        @if (show()) {
        <div #box>Content</div>
        }
      `,
    })
    class TestWithSignalQuery {
      readonly show = signal(true);
      readonly box = viewChild<ElementRef>('box');

      callbackExecuted = false;

      constructor() {
        onDisconnect(this.box, () => {
          this.callbackExecuted = true;
        });
      }
    }

    let fixture: ComponentFixture<TestWithSignalQuery>;

    beforeEach(() => {
      fixture = TestBed.createComponent(TestWithSignalQuery);
      fixture.detectChanges();
    });

    it('should not execute callback initially', () => {
      expect(fixture.componentInstance.callbackExecuted).toBe(false);
    });

    it('should execute callback when element is removed', () => {
      fixture.componentInstance.show.set(false);
      fixture.detectChanges();

      expect(fixture.componentInstance.callbackExecuted).toBe(true);
    });
  });

  describe('with reactive target (manual DOM reading)', () => {
    @Component({
      template: `
        @if (show()) {
        <div id="element">Content</div>
        }
      `,
    })
    class TestWithManualDomReading {
      readonly show = signal(true);
      readonly el = signal<HTMLElement | null>(null);

      callbackExecuted = false;

      constructor() {
        afterNextRender(() => {
          this.el.set(document.getElementById('element'));
        });

        onDisconnect(this.el, () => {
          this.callbackExecuted = true;
        });
      }
    }

    let fixture: ComponentFixture<TestWithManualDomReading>;

    beforeEach(() => {
      fixture = TestBed.createComponent(TestWithManualDomReading);
      fixture.detectChanges();
    });

    it('should not execute callback initially', () => {
      expect(fixture.componentInstance.callbackExecuted).toBe(false);
    });

    it('should execute callback when element is removed', () => {
      fixture.componentInstance.show.set(false);
      fixture.detectChanges();

      expect(fixture.componentInstance.callbackExecuted).toBe(true);
    });
  });

  describe('with non-reactive target (host ElementRef)', () => {
    @Component({
      selector: 'app-child',
      template: 'Child Component',
    })
    class ChildComponent {
      readonly el = inject(ElementRef);

      callbackExecuted = false;

      constructor() {
        onDisconnect(this.el, () => {
          this.callbackExecuted = true;
        });
      }
    }

    @Component({
      imports: [ChildComponent],
      template: `
        @if (showChild()) {
        <app-child />
        }
      `,
    })
    class ParentComponent {
      readonly showChild = signal(true);
    }

    let fixture: ComponentFixture<ParentComponent>;
    let childComponent: ChildComponent;

    beforeEach(() => {
      fixture = TestBed.createComponent(ParentComponent);
      fixture.detectChanges();

      childComponent = fixture.debugElement.query(
        el => el.componentInstance instanceof ChildComponent
      ).componentInstance;
    });

    it('should not execute callback initially', () => {
      expect(childComponent.callbackExecuted).toBe(false);
    });

    it('should execute callback when component is destroyed', () => {
      fixture.componentInstance.showChild.set(false);
      fixture.detectChanges();

      expect(childComponent.callbackExecuted).toBe(true);
    });
  });
});

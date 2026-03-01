import { Component, ElementRef, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { dropzone } from './index';

describe(dropzone.name, () => {
  @Component({
    template: '<div #zone>Drop zone</div>',
  })
  class TestComponent {
    readonly zone = viewChild<ElementRef<HTMLElement>>('zone');
    readonly drop = dropzone(this.zone);
  }

  const createComponent = () => {
    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    return {
      component: fixture.componentInstance,
      element: fixture.nativeElement.querySelector('div') as HTMLElement,
    };
  };

  const createDragEvent = (type: string, files?: File[]): Event => {
    const event = new Event(type, {
      bubbles: true,
      cancelable: true,
    });

    if (files) {
      Object.defineProperty(event, 'dataTransfer', {
        value: {
          files,
          dropEffect: 'none',
        },
        writable: true,
      });
    } else {
      Object.defineProperty(event, 'dataTransfer', {
        value: {
          files: [],
          dropEffect: 'none',
        },
        writable: true,
      });
    }

    Object.defineProperty(event, 'relatedTarget', {
      value: null,
      writable: true,
    });

    return event;
  };

  const createFile = (name: string, type: string, size = 1024): File => {
    return new File(['x'.repeat(size)], name, { type });
  };

  it('should initialize with empty state', () => {
    const { component } = createComponent();

    expect(component.drop.files()).toEqual([]);
    expect(component.drop.isOver()).toBe(false);
    expect(component.drop.isDragging()).toBe(false);
  });

  it('should set isOver when dragging over zone', () => {
    const { component, element } = createComponent();

    element.dispatchEvent(createDragEvent('dragenter'));

    expect(component.drop.isOver()).toBe(true);
  });

  it('should reset isOver when dragging leaves zone', () => {
    const { component, element } = createComponent();

    element.dispatchEvent(createDragEvent('dragenter'));
    expect(component.drop.isOver()).toBe(true);

    element.dispatchEvent(createDragEvent('dragleave'));
    expect(component.drop.isOver()).toBe(false);
  });

  it('should handle files drop', () => {
    const { component, element } = createComponent();
    const file = createFile('test.txt', 'text/plain');

    element.dispatchEvent(createDragEvent('drop', [file]));

    expect(component.drop.files()).toEqual([file]);
    expect(component.drop.isOver()).toBe(false);
  });

  it('should handle multiple files drop', () => {
    const { component, element } = createComponent();
    const file1 = createFile('test1.txt', 'text/plain');
    const file2 = createFile('test2.txt', 'text/plain');

    element.dispatchEvent(createDragEvent('drop', [file1, file2]));

    expect(component.drop.files()).toEqual([file1, file2]);
  });

  it('should set isDragging on document dragenter', () => {
    const { component } = createComponent();

    document.dispatchEvent(createDragEvent('dragenter'));

    expect(component.drop.isDragging()).toBe(true);
  });

  it('should reset isDragging on document drop', () => {
    const { component } = createComponent();

    document.dispatchEvent(createDragEvent('dragenter'));
    expect(component.drop.isDragging()).toBe(true);

    document.dispatchEvent(createDragEvent('drop'));
    expect(component.drop.isDragging()).toBe(false);
  });

  describe('with accept option', () => {
    @Component({
      template: '<div #zone>Drop zone</div>',
    })
    class TestComponentWithAccept {
      readonly zone = viewChild<ElementRef<HTMLElement>>('zone');
      readonly drop = dropzone(this.zone, { accept: ['image/*'] });
    }

    const createComponent = () => {
      const fixture = TestBed.createComponent(TestComponentWithAccept);
      fixture.detectChanges();
      return {
        component: fixture.componentInstance,
        element: fixture.nativeElement.querySelector('div') as HTMLElement,
      };
    };

    it('should filter files by accepted types', () => {
      const { component, element } = createComponent();
      const imageFile = createFile('photo.jpg', 'image/jpeg');
      const textFile = createFile('document.txt', 'text/plain');

      element.dispatchEvent(createDragEvent('drop', [imageFile, textFile]));

      expect(component.drop.files()).toEqual([imageFile]);
    });

    it('should accept exact MIME type match', () => {
      @Component({
        template: '<div #zone>Drop zone</div>',
      })
      class TestExactType {
        readonly zone = viewChild<ElementRef<HTMLElement>>('zone');
        readonly drop = dropzone(this.zone, { accept: ['text/plain'] });
      }

      const fixture = TestBed.createComponent(TestExactType);
      fixture.detectChanges();
      const component = fixture.componentInstance;
      const element = fixture.nativeElement.querySelector('div') as HTMLElement;

      const textFile = createFile('test.txt', 'text/plain');
      const imageFile = createFile('photo.jpg', 'image/jpeg');

      element.dispatchEvent(createDragEvent('drop', [textFile, imageFile]));

      expect(component.drop.files()).toEqual([textFile]);
    });
  });

  describe('with multiple: false option', () => {
    @Component({
      template: '<div #zone>Drop zone</div>',
    })
    class TestComponentSingleFile {
      readonly zone = viewChild<ElementRef<HTMLElement>>('zone');
      readonly drop = dropzone(this.zone, { multiple: false });
    }

    const createComponent = () => {
      const fixture = TestBed.createComponent(TestComponentSingleFile);
      fixture.detectChanges();
      return {
        component: fixture.componentInstance,
        element: fixture.nativeElement.querySelector('div') as HTMLElement,
      };
    };

    it('should accept only one file', () => {
      const { component, element } = createComponent();
      const file1 = createFile('test1.txt', 'text/plain');
      const file2 = createFile('test2.txt', 'text/plain');

      element.dispatchEvent(createDragEvent('drop', [file1, file2]));

      expect(component.drop.files()).toEqual([file1]);
    });
  });

  describe('with reactive accept', () => {
    @Component({
      template: '<div #zone>Drop zone</div>',
    })
    class TestComponentReactiveAccept {
      readonly zone = viewChild<ElementRef<HTMLElement>>('zone');
      readonly acceptTypes = signal(['image/*']);
      readonly drop = dropzone(this.zone, { accept: this.acceptTypes });
    }

    const createComponent = () => {
      const fixture = TestBed.createComponent(TestComponentReactiveAccept);
      fixture.detectChanges();
      return {
        component: fixture.componentInstance,
        element: fixture.nativeElement.querySelector('div') as HTMLElement,
      };
    };

    it('should refilter files when accept changes', () => {
      const { component, element } = createComponent();
      const imageFile = createFile('photo.jpg', 'image/jpeg');
      const textFile = createFile('document.txt', 'text/plain');

      element.dispatchEvent(createDragEvent('drop', [imageFile, textFile]));
      expect(component.drop.files()).toEqual([imageFile]);

      component.acceptTypes.set(['text/*']);
      expect(component.drop.files()).toEqual([textFile]);
    });
  });

  describe('dragCounter logic', () => {
    it('should handle nested dragenter/dragleave correctly', () => {
      const { component, element } = createComponent();

      element.dispatchEvent(createDragEvent('dragenter'));
      expect(component.drop.isOver()).toBe(true);

      element.dispatchEvent(createDragEvent('dragenter'));
      expect(component.drop.isOver()).toBe(true);

      element.dispatchEvent(createDragEvent('dragleave'));
      expect(component.drop.isOver()).toBe(true);

      element.dispatchEvent(createDragEvent('dragleave'));
      expect(component.drop.isOver()).toBe(false);
    });
  });
});

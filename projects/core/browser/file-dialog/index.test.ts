import { Component, signal as ngSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { fileDialog } from './index';

describe(fileDialog.name, () => {
  let createdInputs: HTMLInputElement[];
  let originalCreateElement: typeof document.createElement;

  beforeEach(() => {
    createdInputs = [];
    originalCreateElement = document.createElement.bind(document);

    jest
      .spyOn(document, 'createElement')
      .mockImplementation((tagName: string, options?: ElementCreationOptions) => {
        const el = originalCreateElement(tagName, options);
        if (tagName === 'input') {
          createdInputs.push(el as HTMLInputElement);
          jest.spyOn(el, 'click');
        }
        return el;
      });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const getFileInput = (): HTMLInputElement => {
    const inputs = createdInputs.filter(el => el.type === 'file');
    return inputs[inputs.length - 1];
  };

  @Component({ template: '' })
  class TestComponent {
    readonly fd = fileDialog();
  }

  @Component({ template: '' })
  class TestComponentWithOptions {
    readonly fd = fileDialog({
      multiple: false,
      accept: 'image/*',
      directory: true,
    });
  }

  const createComponent = <T>(component: new (...args: any[]) => T) => {
    const fixture = TestBed.createComponent(component);
    fixture.detectChanges();
    return { fixture, instance: fixture.componentInstance };
  };

  const triggerChange = (input: HTMLInputElement, files: File[]) => {
    const fileList = {
      length: files.length,
      item: (i: number) => files[i] ?? null,
      [Symbol.iterator]: () => files[Symbol.iterator](),
    };
    for (let i = 0; i < files.length; i++) {
      (fileList as any)[i] = files[i];
    }
    Object.defineProperty(input, 'files', {
      value: fileList,
      writable: true,
      configurable: true,
    });
    input.dispatchEvent(new Event('change'));
  };

  it('should have empty files initially', () => {
    const { instance } = createComponent(TestComponent);
    expect(instance.fd.files()).toEqual([]);
  });

  it('should not create input until open() is called', () => {
    createComponent(TestComponent);

    const input = getFileInput();
    expect(input).toBeUndefined();
  });

  it('should create a file input lazily on first open()', () => {
    const { instance } = createComponent(TestComponent);

    instance.fd.open();
    const input = getFileInput();

    expect(input).toBeDefined();
    expect(input.type).toBe('file');
  });

  it('should reuse the same input on subsequent open() calls', () => {
    const { instance } = createComponent(TestComponent);

    instance.fd.open();
    const firstInput = getFileInput();

    instance.fd.open();
    const secondInput = getFileInput();

    expect(firstInput).toBe(secondInput);
  });

  it('should trigger input.click() on open()', () => {
    const { instance } = createComponent(TestComponent);

    instance.fd.open();
    const input = getFileInput();

    expect(input.click).toHaveBeenCalled();
  });

  it('should update files signal on file selection', () => {
    const { instance } = createComponent(TestComponent);

    instance.fd.open();
    const input = getFileInput();

    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    triggerChange(input, [file]);

    expect(instance.fd.files().length).toBe(1);
    expect(instance.fd.files()[0].name).toBe('test.txt');
  });

  it('should reset files and input.value when files are set to []', () => {
    const { instance } = createComponent(TestComponent);

    instance.fd.open();
    const input = getFileInput();

    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    triggerChange(input, [file]);
    expect(instance.fd.files().length).toBe(1);

    Object.defineProperty(input, 'value', {
      value: 'C:\\fakepath\\test.txt',
      writable: true,
      configurable: true,
    });

    instance.fd.files.set([]);
    expect(instance.fd.files()).toEqual([]);
    expect(input.value).toBe('');
  });

  it('should apply default options (multiple=true, accept=*)', () => {
    const { instance } = createComponent(TestComponent);

    instance.fd.open();
    const input = getFileInput();

    expect(input.multiple).toBe(true);
    expect(input.accept).toBe('*');
    expect(input.hasAttribute('webkitdirectory')).toBe(false);
  });

  it('should apply custom options', () => {
    const { instance } = createComponent(TestComponentWithOptions);

    instance.fd.open();
    const input = getFileInput();

    expect(input.multiple).toBe(false);
    expect(input.accept).toBe('image/*');
    expect(input.webkitdirectory).toBe(true);
  });

  it('should reset input.value before each open', () => {
    const { instance } = createComponent(TestComponent);

    instance.fd.open();
    const input = getFileInput();

    Object.defineProperty(input, 'value', {
      value: 'C:\\fakepath\\file.txt',
      writable: true,
      configurable: true,
    });

    instance.fd.open();

    expect(input.value).toBe('');
  });

  it('should nullify input reference on cleanup', () => {
    const { fixture, instance } = createComponent(TestComponent);

    instance.fd.open();

    expect(() => fixture.destroy()).not.toThrow();
  });

  it('should not fail on cleanup if open() was never called', () => {
    const { fixture } = createComponent(TestComponent);

    expect(() => fixture.destroy()).not.toThrow();
  });

  it('should re-filter files when accept signal changes', () => {
    const acceptSignal = ngSignal('*');

    @Component({ template: '' })
    class ReactiveAcceptComponent {
      readonly fd = fileDialog({ accept: acceptSignal });
    }

    const { instance } = createComponent(ReactiveAcceptComponent);

    instance.fd.open();
    const input = getFileInput();

    const img = new File(['img'], 'photo.png', { type: 'image/png' });
    const txt = new File(['text'], 'notes.txt', { type: 'text/plain' });
    triggerChange(input, [img, txt]);

    expect(instance.fd.files().length).toBe(2);

    // Change accept to only images — txt should be filtered out
    acceptSignal.set('image/*');
    TestBed.flushEffects();

    expect(instance.fd.files().length).toBe(1);
    expect(instance.fd.files()[0].name).toBe('photo.png');
  });

  it('should re-filter files when multiple signal changes to false', () => {
    const multipleSignal = ngSignal(true);

    @Component({ template: '' })
    class ReactiveMultipleComponent {
      readonly fd = fileDialog({ multiple: multipleSignal });
    }

    const { instance } = createComponent(ReactiveMultipleComponent);

    instance.fd.open();
    const input = getFileInput();

    const a = new File(['a'], 'a.txt', { type: 'text/plain' });
    const b = new File(['b'], 'b.txt', { type: 'text/plain' });
    triggerChange(input, [a, b]);

    expect(instance.fd.files().length).toBe(2);

    // Change to single mode — only first file should remain
    multipleSignal.set(false);
    TestBed.flushEffects();

    expect(instance.fd.files().length).toBe(1);
    expect(instance.fd.files()[0].name).toBe('a.txt');
  });

  it('should filter by accept on file selection', () => {
    @Component({ template: '' })
    class AcceptFilterComponent {
      readonly fd = fileDialog({ accept: 'image/*' });
    }

    const { instance } = createComponent(AcceptFilterComponent);

    instance.fd.open();
    const input = getFileInput();

    const img = new File(['img'], 'photo.png', { type: 'image/png' });
    const txt = new File(['text'], 'notes.txt', { type: 'text/plain' });
    triggerChange(input, [img, txt]);

    expect(instance.fd.files().length).toBe(1);
    expect(instance.fd.files()[0].name).toBe('photo.png');
  });

  it('should filter by extension accept pattern', () => {
    @Component({ template: '' })
    class ExtensionFilterComponent {
      readonly fd = fileDialog({ accept: '.pdf' });
    }

    const { instance } = createComponent(ExtensionFilterComponent);

    instance.fd.open();
    const input = getFileInput();

    const pdf = new File(['pdf'], 'doc.pdf', { type: 'application/pdf' });
    const txt = new File(['text'], 'notes.txt', { type: 'text/plain' });
    triggerChange(input, [pdf, txt]);

    expect(instance.fd.files().length).toBe(1);
    expect(instance.fd.files()[0].name).toBe('doc.pdf');
  });
});

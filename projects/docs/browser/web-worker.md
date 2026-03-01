---
source: https://github.com/signalityjs/signality/blob/main/projects/core/browser/web-worker/index.ts
---

# WebWorker

Reactive wrapper around the [Web Workers API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API). Communicate with web workers using Angular signals.

<Demo name="web-worker" />

## Usage

```angular-ts
import { Component, effect } from '@angular/core';
import { webWorker } from '@signality/core';

@Component({
  template: `
    <button (click)="calculate()">Calculate</button>
    <p>Result: {{ worker.data() }}</p>
  `,
})
export class WorkerDemo {
  readonly worker = webWorker<number, number>('/workers/calc.js'); // [!code highlight]
  
  calculate() {
    this.worker.post(42);
  }
}
```

## Parameters

| Parameter | Type                                                                            | Description                                                               |
|-----------|---------------------------------------------------------------------------------|---------------------------------------------------------------------------|
| `url`     | [`MaybeSignal<string \| URL>`](/reference/utility-types#maybesignal-lt-type-gt) | Worker script [URL](https://developer.mozilla.org/en-US/docs/Web/API/URL) |
| `options` | `WebWorkerOptions`                                                              | Optional configuration (see [Options](#options) below)                    |

## Options

| Option        | Type                                                | Default     | Description                      |
|---------------|-----------------------------------------------------|-------------|----------------------------------|
| `type`        | `'classic' \| 'module'`                             | `'classic'` | Worker type                      |
| `credentials` | `RequestCredentials`                                | -           | Credentials mode                 |
| `name`        | `string`                                            | -           | Worker name for debugging        |
| `injector`    | [`Injector`](https://angular.dev/api/core/Injector) | -           | Optional injector for DI context |

## Return Value

The `webWorker()` function returns a `WebWorkerRef` object:

| Property    | Type                     | Description                       |
|-------------|--------------------------|-----------------------------------|
| `data`      | `Signal<T \| undefined>` | Last message received from worker |
| `isReady`   | `Signal<boolean>`        | Whether worker is ready           |
| `error`     | `Signal<Error \| null>`  | Last error from worker            |
| `post`      | `(data: I) => void`      | Send message to worker            |
| `terminate` | `() => void`             | Terminate the worker              |

## Examples

### Heavy computation

```angular-ts
import { Component, signal, computed } from '@angular/core';
import { webWorker } from '@signality/core';

interface FibInput {
  n: number;
}

interface FibOutput {
  result: bigint;
  time: number;
}

@Component({
  template: `
    <input 
      type="number" 
      [value]="n()" 
      (input)="n.set(+$any($event.target).value)" 
    />
    <button (click)="calculate()" [disabled]="!worker.isReady()">
      Calculate Fibonacci
    </button>
    
    @if (worker.data(); as result) {
      <p>fib({{ n() }}) = {{ result.result }}</p>
      <p>Computed in {{ result.time }}ms</p>
    }
  `,
})
export class FibonacciCalculator {
  readonly n = signal(40);
  readonly worker = webWorker<FibInput, FibOutput>('/workers/fibonacci.js'); // [!code highlight]
  
  calculate() {
    this.worker.post({ n: this.n() });
  }
}
```

### Image processing

```angular-ts
import { Component, signal } from '@angular/core';
import { webWorker } from '@signality/core';

interface ImageTask {
  imageData: ImageData;
  filter: 'grayscale' | 'blur' | 'sharpen';
}

@Component({
  template: `
    <canvas #canvas></canvas>
    <button (click)="applyFilter('grayscale')">Grayscale</button>
    <button (click)="applyFilter('blur')">Blur</button>
  `,
})
export class ImageProcessor {
  readonly worker = webWorker<ImageTask, ImageData>('/workers/image.js');
  
  applyFilter(filter: ImageTask['filter']) {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    this.worker.post({ imageData, filter }); // [!code highlight]
  }
  
  constructor() {
    effect(() => {
      const processed = this.worker.data();
      if (processed) {
        const ctx = this.canvasRef.nativeElement.getContext('2d')!;
        ctx.putImageData(processed, 0, 0);
      }
    });
  }
}
```

## Worker Script Example

```javascript
// /workers/fibonacci.js
self.onmessage = function(e) {
  const start = performance.now();
  const result = fibonacci(BigInt(e.data.n));
  const time = performance.now() - start;

  self.postMessage({ result: result.toString(), time });
};

function fibonacci(n) {
  if (n <= 1n) return n;
  return fibonacci(n - 1n) + fibonacci(n - 2n);
}
```

## SSR Compatibility

On the server, signals initialize with safe defaults:

- `data` → `undefined`
- `isReady` → `false`
- `error` → `null`
- `post`, `terminate` → no-op functions

## Type Definitions

```typescript
interface WebWorkerOptions extends WithInjector {
  readonly type?: 'classic' | 'module';
  readonly credentials?: RequestCredentials;
  readonly name?: string;
}

interface WebWorkerRef<I, O> {
  readonly data: Signal<O | undefined>;
  readonly isReady: Signal<boolean>;
  readonly error: Signal<Error | null>;
  readonly post: (data: I) => void;
  readonly terminate: () => void;
}

function webWorker<I, O>(
  url: MaybeSignal<string | URL>,
  options?: WebWorkerOptions
): WebWorkerRef<I, O>;
```

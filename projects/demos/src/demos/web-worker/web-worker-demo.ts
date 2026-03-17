import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { webWorker } from '@signality/core';
import { DemoCard, DemoToggle, Wrapper } from '../../common';

@Component({
  selector: 'demo-web-worker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard, DemoToggle],
  templateUrl: './web-worker-demo.html',
  styleUrl: './web-worker-demo.scss',
})
export class WebWorkerDemo {
  readonly toggleOptions = [
    { label: '35', value: 35 as const },
    { label: '40', value: 40 as const },
    { label: '42', value: 42 as const },
  ];
  readonly selected = signal<35 | 40 | 42>(40);
  readonly pending = signal(false);

  private readonly _worker: ReturnType<typeof webWorker<number, number>> | null;

  readonly result = computed(() => {
    const d = this._worker?.data();
    return d !== undefined ? d.toLocaleString() : '—';
  });

  readonly isComputed = computed(() => this._worker?.data() !== undefined);

  readonly hasError = computed(() => !!this._worker?.error());

  readonly statusText = computed(() => {
    if (this.hasError()) return 'Error';
    if (this.pending()) return 'Computing…';
    if (!this._worker?.isReady()) return 'Initializing';
    return this.isComputed() ? 'Done' : 'Ready';
  });

  readonly canCalculate = computed(() => !!this._worker?.isReady() && !this.pending());

  readonly importCode = `import { webWorker } from '@signality/core'`;

  constructor() {
    const platformId = inject(PLATFORM_ID);

    if (isPlatformBrowser(platformId)) {
      const blob = new Blob(
        [
          `self.onmessage=function(e){function f(n){return n<=1?n:f(n-1)+f(n-2)}self.postMessage(f(e.data))}`,
        ],
        { type: 'application/javascript' }
      );
      this._worker = webWorker<number, number>(URL.createObjectURL(blob));
    } else {
      this._worker = null;
    }

    effect(() => {
      this._worker?.data(); // track data changes → clear pending
      this.pending.set(false);
    });
  }

  calculate(): void {
    if (!this._worker || !this._worker.isReady()) return;
    this.pending.set(true);
    this._worker.post(this.selected());
  }
}

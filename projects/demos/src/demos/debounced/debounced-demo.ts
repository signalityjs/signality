import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { debounced } from '@signality/core';
import { DemoCard, DemoInput, Wrapper } from '../../common';

@Component({
  selector: 'demo-debounced',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard, DemoInput, FormsModule],
  templateUrl: './debounced-demo.html',
  styleUrl: './debounced-demo.scss',
})
export class DebouncedDemo {
  readonly importCode = `import { debounced } from '@signality/core'`;

  readonly inputText = debounced('', 0);
  readonly debouncedValue = debounced('', 500);
  readonly label = computed(() => this.debouncedValue() || (this.isDebouncing() ? '' : '—'));
  readonly isDebouncing = computed(() => this.inputText() !== this.debouncedValue());

  onInputChange(value: string): void {
    this.inputText.set(value);
    this.debouncedValue.set(value);
  }
}

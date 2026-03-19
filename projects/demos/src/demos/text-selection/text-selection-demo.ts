import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { textSelection } from '@signality/core';
import { DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-text-selection',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard],
  templateUrl: './text-selection-demo.html',
  styleUrl: './text-selection-demo.scss',
})
export class TextSelectionDemo {
  readonly importCode = `import { textSelection } from '@signality/core'`;

  readonly selection = textSelection();

  readonly hasSelection = computed(() => !!this.selection.text());
  readonly charCount = computed(() => this.selection.text().length);
  readonly wordCount = computed(() => {
    const t = this.selection.text().trim();
    return t ? t.split(/\s+/).length : 0;
  });
  readonly displayText = computed(() => {
    const t = this.selection.text();
    if (!t) return '—';
    return t.length > 36 ? t.slice(0, 36) + '…' : t;
  });
}

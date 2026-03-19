import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';

@Component({
  selector: 'ng-demo-wrapper',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './wrapper.html',
  styleUrl: './wrapper.scss',
})
export class Wrapper {
  readonly demoPath = input('');
  readonly code = input('');
  readonly copied = signal(false);

  readonly sourceUrl = computed(() => {
    const path = this.demoPath();
    if (!path) return '';
    return `https://github.com/signalityjs/signality/blob/main/projects/demos/src/demos/${path}.ts`;
  });

  async copyCode(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.code());
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }
}

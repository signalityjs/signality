import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { fileDialog } from '@signality/core';
import { DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-file-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard],
  templateUrl: './file-dialog-demo.html',
  styleUrl: './file-dialog-demo.scss',
})
export class FileDialogDemo {
  readonly importCode = `import { fileDialog } from '@signality/core'`;

  readonly fd = fileDialog({ accept: '*', multiple: true });
  readonly fdImages = fileDialog({ accept: 'image/*', multiple: true });

  readonly allFiles = computed(() => [...this.fd.files(), ...this.fdImages.files()]);

  readonly hasFiles = computed(() => this.allFiles().length > 0);

  readonly totalSize = computed(() => {
    const bytes = this.allFiles().reduce((sum, f) => sum + f.size, 0);
    if (bytes === 0) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  });

  formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  clearAll(): void {
    this.fd.files.set([]);
    this.fdImages.files.set([]);
  }
}

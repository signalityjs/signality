import { ChangeDetectionStrategy, Component, computed, viewChild } from '@angular/core';
import { dropzone } from '@signality/core';
import { DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-dropzone',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard],
  templateUrl: './dropzone-demo.html',
  styleUrl: './dropzone-demo.scss',
})
export class DropzoneDemo {
  readonly importCode = `import { dropzone } from '@signality/core'`;

  readonly dropZone = viewChild<HTMLElement>('dropZone');
  readonly dz = dropzone(this.dropZone);

  readonly statusLabel = computed(() => {
    if (this.dz.isOver()) return 'Drop here!';
    const count = this.dz.files().length;
    if (count > 0) return count === 1 ? '1 file' : `${count} files`;
    if (this.dz.isDragging()) return 'Dragging…';
    return 'Waiting';
  });

  formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
}

import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  signal,
  viewChild,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { pictureInPicture } from '@signality/core';
import { DemoButton, DemoCard, DemoNotSupported, Wrapper } from '../../common';

@Component({
  selector: 'demo-picture-in-picture',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard, DemoButton, DemoNotSupported],
  templateUrl: './picture-in-picture-demo.html',
  styleUrl: './picture-in-picture-demo.scss',
})
export class PictureInPictureDemo {
  readonly importCode = `import { pictureInPicture } from '@signality/core'`;

  readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  readonly video = viewChild<ElementRef<HTMLVideoElement>>('video');
  readonly pip = pictureInPicture(this.video);
  readonly videoLoaded = signal(false);
  readonly isActive = computed(() => this.pip.isActive());

  onVideoLoaded(): void {
    this.videoLoaded.set(true);
  }

  async handleToggle(): Promise<void> {
    const video = this.video()?.nativeElement;
    if (!video) return;

    if (video.paused) {
      try {
        await video.play();
      } catch (e) {
        console.error('Failed to play video:', e);
      }
    }
    await this.pip.toggle();
  }
}

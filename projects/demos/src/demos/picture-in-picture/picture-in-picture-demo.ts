import {
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  inject,
  PLATFORM_ID,
  signal,
  viewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { pictureInPicture } from '@signality/core';
import { DemoButton, DemoCard, DemoNotSupported, Wrapper } from '../../common';

const MOBILE_REGEX = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;

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
  readonly isActive = this.pip.isActive;
  readonly isMobileDevice = signal(false);

  constructor() {
    effect(() => {
      this.isMobileDevice.set(MOBILE_REGEX.test(navigator.userAgent));
    });

    effect(async () => {
      if (this.isMobileDevice()) {
        return;
      }

      const video = this.video()?.nativeElement;
      const pipActive = this.isActive;

      if (!video) {
        return;
      }

      if (pipActive()) {
        try {
          await video.play();
        } catch (e) {
          console.error('Failed to play video:', e);
        }
      } else {
        video.pause();
      }
    });
  }

  onVideoLoaded(): void {
    this.videoLoaded.set(true);
  }

  async handleToggle(): Promise<void> {
    await this.pip.toggle();
  }
}

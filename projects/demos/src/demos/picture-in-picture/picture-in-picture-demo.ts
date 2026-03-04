import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  viewChild,
  ElementRef,
  inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { pictureInPicture } from '@signality/core/browser/picture-in-picture';
import { DemoBadge, DemoButton, Wrapper } from '../../common';

@Component({
  selector: 'demo-picture-in-picture',
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoBadge, DemoButton],
  template: `
    <ng-demo-wrapper [code]="importCode">
      @if (!isBrowser) {
      <div class="not-supported">
        <demo-badge type="error">Picture-in-Picture not supported</demo-badge>
        <p class="not-supported-text">Use a Chromium-based browser to test PiP.</p>
      </div>
      } @else {
      <div class="pip-card">
        <div class="video-container">
          <video
            #video
            class="video"
            src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
            muted
            loop
            playsinline
            (loadedmetadata)="onVideoLoaded()"
          ></video>
        </div>

        <div class="controls">
          <demo-button variant="primary" (click)="handleToggle()" [disabled]="!videoLoaded()">
            @if (pip.isActive()) {
            <span>Exit PiP</span>
            } @else {
            <span>Enter PiP</span>
            }
          </demo-button>

          <demo-badge [type]="pip.isActive() ? 'success' : 'neutral'">
            {{ pip.isActive() ? 'Active' : 'Inactive' }}
          </demo-badge>
        </div>
      </div>
      }
    </ng-demo-wrapper>
  `,
  styles: `
    .not-supported {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      padding: 2rem;
      text-align: center;
    }

    .not-supported-text {
      color: #a1a1aa;
      font-size: 0.875rem;
      margin: 0;
    }

    .pip-card {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .video-container {
      position: relative;
      width: 100%;
      aspect-ratio: 16 / 9;
      background: #0f0f11;
      border-radius: 8px;
      overflow: hidden;
    }

    .video {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .controls {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
  `,
})
export class PictureInPictureDemo {
  readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  readonly video = viewChild<ElementRef<HTMLVideoElement>>('video');
  readonly pip = pictureInPicture(this.video);
  readonly videoLoaded = signal(false);

  readonly importCode = `import { pictureInPicture } from '@signality/core'`;

  onVideoLoaded(): void {
    this.videoLoaded.set(true);
  }

  async handleToggle(): Promise<void> {
    const video = this.video()?.nativeElement;
    if (video) {
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
}

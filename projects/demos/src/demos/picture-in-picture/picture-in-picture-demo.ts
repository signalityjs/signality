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
import { pictureInPicture } from '@signality/core/browser/picture-in-picture';
import { DemoButton, DemoCard, DemoNotSupported, Wrapper } from '../../common';

@Component({
  selector: 'demo-picture-in-picture',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard, DemoButton, DemoNotSupported],
  template: `
    <ng-demo-wrapper [demoPath]="'picture-in-picture/picture-in-picture-demo'" [code]="importCode">
      @if (!isBrowser) {
      <demo-not-supported
        title="Not supported"
        description="Picture-in-Picture requires a Chromium-based browser."
        [hints]="['Chrome', 'Edge', 'Opera']"
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M11 19H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5" />
          <rect width="9" height="7" x="13" y="13" rx="1" />
        </svg>
      </demo-not-supported>
      } @else {
      <demo-card>
        <div class="pip-wrap">
          <!-- Hidden functional video -->
          <video
            #video
            class="pip-video"
            src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
            muted
            loop
            playsinline
            (loadedmetadata)="onVideoLoaded()"
          ></video>

          <!-- Icon ring -->
          <div class="pip-visual">
            <div class="pip-radar" [class.pip-radar--active]="isActive()">
              <div class="pip-radar-ring pip-radar-ring--1"></div>
              <div class="pip-radar-ring pip-radar-ring--2"></div>
              <div class="pip-radar-ring pip-radar-ring--3"></div>
              <div
                class="pip-icon-ring"
                [class.pip-icon-ring--active]="isActive()"
                [class.pip-icon-ring--idle]="!isActive()"
              >
                <div class="pip-icon-inner">
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M11 19H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5" />
                    <rect class="pip-float-rect" width="9" height="7" x="13" y="13" rx="1" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- Text -->
          <div class="pip-text">
            <h3 class="pip-title">{{ isActive() ? 'Picture-in-Picture' : 'Inactive' }}</h3>
            <p class="pip-subtitle">
              {{
                isActive()
                  ? 'Video is floating in a separate window'
                  : 'Float the video above other windows'
              }}
            </p>
          </div>

          <!-- Button -->
          <demo-button
            variant="secondary"
            size="sm"
            [disabled]="!videoLoaded()"
            (click)="handleToggle()"
          >
            {{ isActive() ? 'Exit PiP' : 'Enter PiP' }}
          </demo-button>
        </div>
      </demo-card>
      }
    </ng-demo-wrapper>
  `,
  styles: `
    .pip-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding-top: 0.5rem;
      padding-bottom: 1.25rem;
      gap: 0;
    }

    /* ── Hidden video ── */
    .pip-video {
      position: absolute;
      width: 1px;
      height: 1px;
      opacity: 0;
      pointer-events: none;
    }

    /* ── Visual ── */
    .pip-visual {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 0.5rem;
    }

    /* ── Radar ── */
    .pip-radar {
      position: relative;
      width: 120px;
      height: 120px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .pip-radar-ring {
      position: absolute;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      border: 1px solid rgba(222, 179, 235, 0.25);
      opacity: 0;
      animation: pipRadar 3.4s cubic-bezier(0, 0, 0.5, 1) infinite;
      animation-play-state: paused;
    }

    .pip-radar--active .pip-radar-ring {
      animation-play-state: running;
    }

    .pip-radar-ring--1 { animation-delay: 0s; }
    .pip-radar-ring--2 { animation-delay: 1.067s; }
    .pip-radar-ring--3 { animation-delay: 2.133s; }

    @keyframes pipRadar {
      0%   { transform: scale(1); opacity: 0; }
      12%  { opacity: 0.4; border-color: rgba(222, 179, 235, 0.2); }
      100% { transform: scale(2.6); opacity: 0; border-color: rgba(222, 179, 235, 0); }
    }

    /* ── Icon ring ── */
    .pip-icon-ring {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition:
        border-color 0.4s ease,
        background 0.4s ease;
    }

    .pip-icon-ring--idle {
      border: 1px solid rgba(113, 113, 122, 0.2);
      background: rgba(113, 113, 122, 0.05);
    }

    .pip-icon-ring--active {
      border: 1px solid rgba(222, 179, 235, 0.3);
      background: rgba(222, 179, 235, 0.08);
    }

    /* ── Icon ── */
    .pip-icon-inner {
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.4s ease;
    }

    .pip-icon-ring--idle   .pip-icon-inner { color: #52525b; }
    .pip-icon-ring--active .pip-icon-inner { color: #DEB3EB; }

    /* ── Floating window animation ── */
    @keyframes pipFloat {
      0%, 100% { transform: translate(0, 0); }
      50%       { transform: translate(1px, -2px); }
    }

    .pip-float-rect {
      transform-origin: 17.5px 16.5px;
      animation: pipFloat 2.5s ease-in-out infinite;
      animation-play-state: paused;
    }

    .pip-icon-ring--active .pip-float-rect {
      animation-play-state: running;
    }

    /* ── Typography ── */
    .pip-text {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 1.25rem;
    }

    .pip-title {
      font-size: 1.125rem;
      font-weight: 600;
      margin: 0 0 0.375rem 0;
      text-align: center;
      letter-spacing: -0.01em;
      color: #eee;
    }

    .pip-subtitle {
      font-size: 0.8125rem;
      font-weight: 400;
      color: #71717a;
      margin: 0;
      text-align: center;
      line-height: 1.5;
    }
  `,
})
export class PictureInPictureDemo {
  readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  readonly video = viewChild<ElementRef<HTMLVideoElement>>('video');
  readonly pip = pictureInPicture(this.video);
  readonly videoLoaded = signal(false);
  readonly isActive = computed(() => this.pip.isActive());

  readonly importCode = `import { pictureInPicture } from '@signality/core'`;

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

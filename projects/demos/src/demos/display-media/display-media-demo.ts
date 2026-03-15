import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { displayMedia } from '@signality/core/browser/display-media';
import { DemoButton, DemoCard, DemoNotSupported, Wrapper } from '../../common';

@Component({
  selector: 'demo-display-media',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard, DemoButton, DemoNotSupported],
  template: `
    <ng-demo-wrapper [demoPath]="'display-media/display-media-demo'" [code]="importCode">
      @if (state() === 'unsupported') {
      <demo-not-supported
        title="Screen Capture Not Available"
        description="Screen Capture API requires a secure origin and a modern browser."
        [hints]="['Chrome 72+', 'Firefox 66+', 'Edge 79+']"
      >
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      </demo-not-supported>
      } @else {
      <demo-card>
        <div class="dm-wrap">
          <!-- Preview area -->
          <div class="dm-preview" [class.dm-preview--active]="state() === 'active'">
            @if (dm.stream()) {
            <video class="dm-video" [srcObject]="dm.stream()" autoplay muted playsinline></video>
            <div class="dm-rec">
              <span class="dm-rec-dot"></span>
              <span class="dm-rec-label">Live</span>
            </div>
            } @else {
            <div class="dm-idle-content">
              <svg
                class="dm-idle-icon"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.25"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </div>
            }

            <!-- Hover overlay button -->
            <div class="dm-overlay" [class.dm-overlay--video]="state() === 'active'">
              <button class="dm-overlay-btn" (click)="toggle()">
                {{ buttonLabel() }}
              </button>
            </div>
          </div>

          <!-- Error area -->
          <div class="dm-error-area" [class.dm-error-area--visible]="state() === 'error'">
            <p class="dm-error-text">{{ errorMessage() }}</p>
          </div>
        </div>
      </demo-card>
      }
    </ng-demo-wrapper>
  `,
  styles: `
    .dm-wrap {
      display: flex;
      flex-direction: column;
      padding-top: 0.25rem;
      padding-bottom: 0.25rem;
    }

    /* ── Preview area ── */
    .dm-preview {
      position: relative;
      height: 160px;
      background: #0a0a0c;
      border-radius: 8px;
      border: 1px solid #1a1a1d;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: border-color 0.3s ease;
    }

    .dm-preview--active {
      border-color: rgba(239, 68, 68, 0.2);
    }

    .dm-video {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    /* ── Idle placeholder ── */
    .dm-idle-content {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .dm-idle-icon {
      color: #27272a;
    }

    /* ── REC indicator ── */
    .dm-rec {
      position: absolute;
      top: 0.625rem;
      right: 0.625rem;
      display: flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.25rem 0.625rem;
      background: rgba(0, 0, 0, 0.55);
      border-radius: 9999px;
      backdrop-filter: blur(6px);
    }

    .dm-rec-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #ef4444;
      flex-shrink: 0;
      animation: recPulse 1.2s ease-in-out infinite;
    }

    @keyframes recPulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.35; }
    }

    .dm-rec-label {
      font-size: 0.6875rem;
      font-weight: 500;
      color: #e4e4e7;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    /* ── Error area ── */
    .dm-error-area {
      max-height: 0;
      overflow: hidden;
      opacity: 0;
      transition:
        max-height 0.35s ease,
        opacity 0.3s ease,
        margin-top 0.35s ease;
    }

    .dm-error-area--visible {
      max-height: 40px;
      opacity: 1;
      margin-top: 0.75rem;
    }

    .dm-error-text {
      font-size: 0.8125rem;
      color: #a1a1aa;
      margin: 0;
      text-align: center;
    }

    /* ── Hover overlay ── */
    .dm-overlay {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.2s ease;
      pointer-events: none;
      border-radius: 7px;
    }

    .dm-overlay--video {
      background: rgba(0, 0, 0, 0.45);
      backdrop-filter: blur(2px);
    }

    .dm-preview:hover .dm-overlay {
      opacity: 1;
      pointer-events: auto;
    }

    .dm-overlay-btn {
      padding: 0.5rem 1.25rem;
      border-radius: 6px;
      background: #DEB3EB;
      color: #0f0f11;
      font-family: inherit;
      font-size: 0.875rem;
      font-weight: 500;
      border: none;
      cursor: pointer;
      transition: background 0.15s ease;
    }

    .dm-overlay-btn:hover {
      background: #d4a3e4;
    }
  `,
})
export class DisplayMediaDemo {
  readonly dm = displayMedia();

  readonly importCode = `import { displayMedia } from '@signality/core'`;

  readonly state = computed<'unsupported' | 'idle' | 'active' | 'error'>(() => {
    if (!this.dm.isSupported()) return 'unsupported';
    if (this.dm.error()) return 'error';
    if (this.dm.isActive()) return 'active';
    return 'idle';
  });

  readonly errorMessage = computed(() => {
    const err = this.dm.error();
    if (!err) return '';
    if (err.name === 'NotAllowedError') return 'Permission denied by user';
    if (err.name === 'NotFoundError') return 'No capture source found';
    return err.message;
  });

  readonly buttonLabel = computed(() => {
    if (this.state() === 'active') return 'Stop Capture';
    if (this.state() === 'error') return 'Try again';
    return 'Start Capture';
  });

  async toggle(): Promise<void> {
    if (this.dm.isActive()) {
      this.dm.stop();
    } else {
      await this.dm.start();
    }
  }
}

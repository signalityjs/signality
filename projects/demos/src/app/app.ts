import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { ActiveElementDemo } from '../demos/active-element/active-element-demo';
import { BatteryDemo } from '../demos/battery/battery-demo';
import { BrowserLanguageDemo } from '../demos/browser-language/browser-language-demo';
import { BluetoothDemo } from '../demos/bluetooth/bluetooth-demo';
import { BreakpointsDemo } from '../demos/breakpoints/breakpoints-demo';
import { BroadcastChannelDemo } from '../demos/broadcast-channel/broadcast-channel-demo';
import { ClipboardDemo } from '../demos/clipboard/clipboard-demo';
import { DebouncedDemo } from '../demos/debounced/debounced-demo';
import { DisplayMediaDemo } from '../demos/display-media/display-media-demo';
import { DropzoneDemo } from '../demos/dropzone/dropzone-demo';
import { EyeDropperDemo } from '../demos/eye-dropper/eye-dropper-demo';
import { FileDialogDemo } from '../demos/file-dialog/file-dialog-demo';
import { ElementFocusDemo } from '../demos/element-focus/element-focus-demo';
import { ElementFocusWithinDemo } from '../demos/element-focus-within/element-focus-within-demo';
import { ElementHoverDemo } from '../demos/element-hover/element-hover-demo';
import { ElementSizeDemo } from '../demos/element-size/element-size-demo';
import { ElementVisibilityDemo } from '../demos/element-visibility/element-visibility-demo';
import { FaviconDemo } from '../demos/favicon/favicon-demo';
import { FpsDemo } from '../demos/fps/fps-demo';
import { FullscreenDemo } from '../demos/fullscreen/fullscreen-demo';
import { GamepadDemo } from '../demos/gamepad/gamepad-demo';
import { GeolocationDemo } from '../demos/geolocation/geolocation-demo';
import { IntervalDemo } from '../demos/interval/interval-demo';
import { LongPressDemo } from '../demos/long-press/long-press-demo';
import { IntersectionObserverDemo } from '../demos/intersection-observer/intersection-observer-demo';
import { MutationObserverDemo } from '../demos/mutation-observer/mutation-observer-demo';
import { ResizeObserverDemo } from '../demos/resize-observer/resize-observer-demo';
import { MediaQueryDemo } from '../demos/media-query/media-query-demo';
import { MousePositionDemo } from '../demos/mouse-position/mouse-position-demo';
import { NetworkDemo } from '../demos/network/network-demo';
import { OnClickOutsideDemo } from '../demos/on-click-outside/on-click-outside-demo';
import { OnlineDemo } from '../demos/online/online-demo';
import { PageVisibilityDemo } from '../demos/page-visibility/page-visibility-demo';
import { PictureInPictureDemo } from '../demos/picture-in-picture/picture-in-picture-demo';
import { ScrollPositionDemo } from '../demos/scroll/scroll-position-demo';
import { WebShareDemo } from '../demos/web-share/web-share-demo';
import { SpeechRecognitionDemo } from '../demos/speech-recognition/speech-recognition-demo';
import { SpeechSynthesisDemo } from '../demos/speech-synthesis/speech-synthesis-demo';
import { StorageDemo } from '../demos/storage/storage-demo';
import { PointerSwipeDemo } from '../demos/pointer-swipe/pointer-swipe-demo';
import { SwipeDemo } from '../demos/swipe/swipe-demo';
import { TextDirectionDemo } from '../demos/text-direction/text-direction-demo';
import { TextSelectionDemo } from '../demos/text-selection/text-selection-demo';
import { ThrottledDemo } from '../demos/throttled/throttled-demo';
import { VibrationDemo } from '../demos/vibration/vibration-demo';
import { WakeLockDemo } from '../demos/wake-lock/wake-lock-demo';
import { WebNotificationDemo } from '../demos/web-notification/web-notification-demo';
import { WebWorkerDemo } from '../demos/web-worker/web-worker-demo';
import { WindowFocusDemo } from '../demos/window-focus/window-focus-demo';
import { WindowSizeDemo } from '../demos/window-size/window-size-demo';

/**
 * Development App
 *
 * Used for local development and testing of demo components.
 * Not used in the Custom Elements build.
 */
@Component({
  selector: 'app-root',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ActiveElementDemo,
    BatteryDemo,
    BluetoothDemo,
    BrowserLanguageDemo,
    BreakpointsDemo,
    BroadcastChannelDemo,
    ClipboardDemo,
    DebouncedDemo,
    DropzoneDemo,
    DisplayMediaDemo,
    EyeDropperDemo,
    FileDialogDemo,
    ElementFocusDemo,
    ElementFocusWithinDemo,
    ElementHoverDemo,
    ElementSizeDemo,
    ElementVisibilityDemo,
    FaviconDemo,
    FpsDemo,
    FullscreenDemo,
    GamepadDemo,
    GeolocationDemo,
    IntervalDemo,
    LongPressDemo,
    IntersectionObserverDemo,
    MutationObserverDemo,
    ResizeObserverDemo,
    MediaQueryDemo,
    MousePositionDemo,
    NetworkDemo,
    OnClickOutsideDemo,
    OnlineDemo,
    PageVisibilityDemo,
    PictureInPictureDemo,
    ScrollPositionDemo,
    WebShareDemo,
    SpeechRecognitionDemo,
    SpeechSynthesisDemo,
    StorageDemo,
    PointerSwipeDemo,
    SwipeDemo,
    TextDirectionDemo,
    TextSelectionDemo,
    ThrottledDemo,
    VibrationDemo,
    WakeLockDemo,
    WebNotificationDemo,
    WebWorkerDemo,
    WindowFocusDemo,
    WindowSizeDemo,
  ],
  template: `
    <div class="dev-container">
      <h1>Signality Demos</h1>
      <p>Development environment for demo components</p>

      <section>
        <h2>Battery Demo</h2>
        <demo-battery />
      </section>

      <section>
        <h2>Browser Language Demo</h2>
        <demo-browser-language />
      </section>

      <section>
        <h2>Clipboard Demo</h2>
        <demo-clipboard />
      </section>

      <section>
        <h2>Debounced Demo</h2>
        <demo-debounced />
      </section>

      <section>
        <h2>Active Element Demo</h2>
        <demo-active-element />
      </section>

      <section>
        <h2>Dropzone Demo</h2>
        <demo-dropzone />
      </section>

      <section>
        <h2>Element Focus Demo</h2>
        <demo-element-focus />
      </section>

      <section>
        <h2>Element Focus Within Demo</h2>
        <demo-element-focus-within />
      </section>

      <section>
        <h2>Element Hover Demo</h2>
        <demo-element-hover />
      </section>

      <section>
        <h2>Long Press Demo</h2>
        <demo-on-long-press />
      </section>

      <section>
        <h2>Element Size Demo</h2>
        <demo-element-size />
      </section>

      <section>
        <h2>Element Visibility Demo</h2>
        <demo-element-visibility />
      </section>

      <section>
        <h2>Favicon Demo</h2>
        <demo-favicon />
      </section>

      <section>
        <h2>FPS Demo</h2>
        <demo-fps />
      </section>

      <section>
        <h2>Fullscreen Demo</h2>
        <demo-fullscreen />
      </section>

      <section>
        <h2>Mouse Position Demo</h2>
        <demo-mouse-position />
      </section>

      <section>
        <h2>Scroll Position Demo</h2>
        <demo-scroll-position />
      </section>

      <section>
        <h2>Text Direction Demo</h2>
        <demo-text-direction />
      </section>

      <section>
        <h2>Text Selection Demo</h2>
        <demo-text-selection />
      </section>

      <section>
        <h2>Throttled Demo</h2>
        <demo-throttled />
      </section>

      <section>
        <h2>Window Focus Demo</h2>
        <demo-window-focus />
      </section>

      <section>
        <h2>Window Size Demo</h2>
        <demo-window-size />
      </section>

      <section>
        <h2>Bluetooth Demo</h2>
        <demo-bluetooth />
      </section>

      <section>
        <h2>Breakpoints Demo</h2>
        <demo-breakpoints />
      </section>

      <section>
        <h2>Broadcast Channel Demo</h2>
        <demo-broadcast-channel />
      </section>

      <section>
        <h2>Gamepad Demo</h2>
        <demo-gamepad />
      </section>

      <section>
        <h2>Geolocation Demo</h2>
        <demo-geolocation />
      </section>

      <section>
        <h2>Interval Demo</h2>
        <demo-interval />
      </section>

      <section>
        <h2>Media Query Demo</h2>
        <demo-media-query />
      </section>

      <section>
        <h2>Online Demo</h2>
        <demo-online />
      </section>

      <section>
        <h2>On Click Outside Demo</h2>
        <demo-on-click-outside />
      </section>

      <section>
        <h2>Network Demo</h2>
        <demo-network />
      </section>

      <section>
        <h2>Page Visibility Demo</h2>
        <demo-page-visibility />
      </section>

      <section>
        <h2>Share Demo</h2>
        <demo-web-share />
      </section>

      <section>
        <h2>Display Media Demo</h2>
        <demo-display-media />
      </section>

      <section>
        <h2>Eye Dropper Demo</h2>
        <demo-eye-dropper />
      </section>

      <section>
        <h2>File Dialog Demo</h2>
        <demo-file-dialog />
      </section>

      <section>
        <h2>Picture in Picture Demo</h2>
        <demo-picture-in-picture />
      </section>

      <section>
        <h2>Speech Recognition Demo</h2>
        <demo-speech-recognition />
      </section>

      <section>
        <h2>Speech Synthesis Demo</h2>
        <demo-speech-synthesis />
      </section>

      <section>
        <h2>Storage Demo</h2>
        <demo-storage />
      </section>

      <section>
        <h2>Swipe Demo</h2>
        <demo-swipe />
      </section>

      <section>
        <h2>Pointer Swipe Demo</h2>
        <demo-pointer-swipe />
      </section>

      <section>
        <h2>Vibration Demo</h2>
        <demo-vibration />
      </section>

      <section>
        <h2>Wake Lock Demo</h2>
        <demo-wake-lock />
      </section>

      <section>
        <h2>Web Notification Demo</h2>
        <demo-web-notification />
      </section>

      <section>
        <h2>Web Worker Demo</h2>
        <demo-web-worker />
      </section>

      <section>
        <h2>IntersectionObserver Demo</h2>
        <demo-intersection-observer />
      </section>

      <section>
        <h2>MutationObserver Demo</h2>
        <demo-mutation-observer />
      </section>

      <section>
        <h2>ResizeObserver Demo</h2>
        <demo-resize-observer />
      </section>
    </div>
  `,
  styles: `
      .dev-container {
        max-width: 800px;
        margin: 2rem auto;
        padding: 2rem;
        font-family: system-ui, sans-serif;
      }

      h1 {
        color: #6366f1;
      }

      section {
        margin-top: 2rem;
        padding: 1rem;
        border: 1px solid #333;
        border-radius: 8px;
      }

      h2 {
        margin-bottom: 1rem;
        font-size: 1.25rem;
      }
    `,
})
export class App {}

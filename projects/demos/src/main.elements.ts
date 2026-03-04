/**
 * Custom Elements Entry Point
 *
 * This file registers all demo components as Custom Elements (Web Components)
 * for use in the VitePress documentation.
 *
 * Each demo is registered with the prefix "signality-demo-"
 * Example: <signality-demo-battery />
 */

import { createApplication } from '@angular/platform-browser';
import { createCustomElement } from '@angular/elements';
import { ApplicationRef, provideZonelessChangeDetection } from '@angular/core';

import { ActiveElementDemo } from './demos/active-element/active-element-demo';
import { BatteryDemo } from './demos/battery/battery-demo';
import { BluetoothDemo } from './demos/bluetooth/bluetooth-demo';
import { BreakpointsDemo } from './demos/breakpoints/breakpoints-demo';
import { BroadcastChannelDemo } from './demos/broadcast-channel/broadcast-channel-demo';
import { BrowserLanguageDemo } from './demos/browser-language/browser-language-demo';
import { ClipboardDemo } from './demos/clipboard/clipboard-demo';
import { DebouncedDemo } from './demos/debounced/debounced-demo';
import { DevicePostureDemo } from './demos/device-posture/device-posture-demo';
import { DisplayMediaDemo } from './demos/display-media/display-media-demo';
import { DropzoneDemo } from './demos/dropzone/dropzone-demo';
import { EyeDropperDemo } from './demos/eye-dropper/eye-dropper-demo';
import { ElementFocusDemo } from './demos/element-focus/element-focus-demo';
import { ElementFocusWithinDemo } from './demos/element-focus-within/element-focus-within-demo';
import { ElementHoverDemo } from './demos/element-hover/element-hover-demo';
import { ElementSizeDemo } from './demos/element-size/element-size-demo';
import { ElementVisibilityDemo } from './demos/element-visibility/element-visibility-demo';
import { FaviconDemo } from './demos/favicon/favicon-demo';
import { FocusMonitorDemo } from './demos/focus-monitor/focus-monitor-demo';
import { FpsDemo } from './demos/fps/fps-demo';
import { GamepadDemo } from './demos/gamepad/gamepad-demo';
import { GeolocationDemo } from './demos/geolocation/geolocation-demo';
import { InputModalityDemo } from './demos/input-modality/input-modality-demo';
import { InputModalityBrowserDemo } from './demos/input-modality-browser/input-modality-browser-demo';
import { IntervalDemo } from './demos/interval/interval-demo';
import { LongPressDemo } from './demos/long-press/long-press-demo';
import { LiveAnnouncerDemo } from './demos/live-announcer/live-announcer-demo';
import { IntersectionObserverDemo } from './demos/intersection-observer/intersection-observer-demo';
import { MutationObserverDemo } from './demos/mutation-observer/mutation-observer-demo';
import { ResizeObserverDemo } from './demos/resize-observer/resize-observer-demo';
import { MediaQueryDemo } from './demos/media-query/media-query-demo';
import { MouseDemo } from './demos/mouse/mouse-demo';
import { NetworkDemo } from './demos/network/network-demo';
import { OnClickOutsideDemo } from './demos/on-click-outside/on-click-outside-demo';
import { OnlineDemo } from './demos/online/online-demo';
import { PageVisibilityDemo } from './demos/page-visibility/page-visibility-demo';
import { PictureInPictureDemo } from './demos/picture-in-picture/picture-in-picture-demo';
import { ScrollDemo } from './demos/scroll/scroll-demo';
import { WebShareDemo } from './demos/web-share/web-share-demo';
import { SpeechRecognitionDemo } from './demos/speech-recognition/speech-recognition-demo';
import { SpeechSynthesisDemo } from './demos/speech-synthesis/speech-synthesis-demo';
import { StorageDemo } from './demos/storage/storage-demo';
import { SwipeDemo } from './demos/swipe/swipe-demo';
import { TextDirectionDemo } from './demos/text-direction/text-direction-demo';
import { TextSelectionDemo } from './demos/text-selection/text-selection-demo';
import { ThrottledDemo } from './demos/throttled/throttled-demo';
import { VibrateDemo } from './demos/vibrate/vibrate-demo';
import { WakeLockDemo } from './demos/wake-lock/wake-lock-demo';
import { WebNotificationDemo } from './demos/web-notification/web-notification-demo';
import { WebWorkerDemo } from './demos/web-worker/web-worker-demo';
import { WindowSizeDemo } from './demos/window-size/window-size-demo';
import { ScreenOrientationDemo } from './demos/screen-orientation/screen-orientation-demo';

const DEMOS = [
  { component: ActiveElementDemo, name: 'signality-demo-active-element' },
  { component: BatteryDemo, name: 'signality-demo-battery' },
  { component: BluetoothDemo, name: 'signality-demo-bluetooth' },
  { component: BreakpointsDemo, name: 'signality-demo-breakpoints' },
  { component: BroadcastChannelDemo, name: 'signality-demo-broadcast-channel' },
  { component: BrowserLanguageDemo, name: 'signality-demo-browser-language' },
  { component: ClipboardDemo, name: 'signality-demo-clipboard' },
  { component: DebouncedDemo, name: 'signality-demo-debounced' },
  { component: DevicePostureDemo, name: 'signality-demo-device-posture' },
  { component: DisplayMediaDemo, name: 'signality-demo-display-media' },
  { component: DropzoneDemo, name: 'signality-demo-dropzone' },
  { component: EyeDropperDemo, name: 'signality-demo-eye-dropper' },
  { component: ElementFocusDemo, name: 'signality-demo-element-focus' },
  { component: ElementFocusWithinDemo, name: 'signality-demo-element-focus-within' },
  { component: ElementHoverDemo, name: 'signality-demo-element-hover' },
  { component: ElementSizeDemo, name: 'signality-demo-element-size' },
  { component: ElementVisibilityDemo, name: 'signality-demo-element-visibility' },
  { component: FaviconDemo, name: 'signality-demo-favicon' },
  { component: FocusMonitorDemo, name: 'signality-demo-focus-monitor' },
  { component: FpsDemo, name: 'signality-demo-fps' },
  { component: GamepadDemo, name: 'signality-demo-gamepad' },
  { component: GeolocationDemo, name: 'signality-demo-geolocation' },
  { component: InputModalityDemo, name: 'signality-demo-input-modality' },
  { component: InputModalityBrowserDemo, name: 'signality-demo-input-modality-browser' },
  { component: IntervalDemo, name: 'signality-demo-interval' },
  { component: LiveAnnouncerDemo, name: 'signality-demo-live-announcer' },
  { component: LongPressDemo, name: 'signality-demo-long-press' },
  { component: IntersectionObserverDemo, name: 'signality-demo-intersection-observer' },
  { component: MutationObserverDemo, name: 'signality-demo-mutation-observer' },
  { component: ResizeObserverDemo, name: 'signality-demo-resize-observer' },
  { component: MediaQueryDemo, name: 'signality-demo-media-query' },
  { component: MouseDemo, name: 'signality-demo-mouse' },
  { component: NetworkDemo, name: 'signality-demo-network' },
  { component: ScreenOrientationDemo, name: 'signality-demo-screen-orientation' },
  { component: OnClickOutsideDemo, name: 'signality-demo-on-click-outside' },
  { component: OnlineDemo, name: 'signality-demo-online' },
  { component: PageVisibilityDemo, name: 'signality-demo-page-visibility' },
  { component: PictureInPictureDemo, name: 'signality-demo-picture-in-picture' },
  { component: ScrollDemo, name: 'signality-demo-scroll' },
  { component: WebShareDemo, name: 'signality-demo-web-share' },
  { component: SpeechRecognitionDemo, name: 'signality-demo-speech-recognition' },
  { component: SpeechSynthesisDemo, name: 'signality-demo-speech-synthesis' },
  { component: StorageDemo, name: 'signality-demo-storage' },
  { component: SwipeDemo, name: 'signality-demo-swipe' },
  { component: TextDirectionDemo, name: 'signality-demo-text-direction' },
  { component: TextSelectionDemo, name: 'signality-demo-text-selection' },
  { component: ThrottledDemo, name: 'signality-demo-throttled' },
  { component: VibrateDemo, name: 'signality-demo-vibrate' },
  { component: WakeLockDemo, name: 'signality-demo-wake-lock' },
  { component: WebNotificationDemo, name: 'signality-demo-web-notification' },
  { component: WebWorkerDemo, name: 'signality-demo-web-worker' },
  { component: WindowSizeDemo, name: 'signality-demo-window-size' },
] as const;

(async () => {
  const app: ApplicationRef = await createApplication({
    providers: [provideZonelessChangeDetection()],
  });

  for (const { component, name } of DEMOS) {
    const element = createCustomElement(component, { injector: app.injector });

    if (!customElements.get(name)) {
      customElements.define(name, element);
    }
  }

  if (ngDevMode) {
    console.log(
      '[Signality Demos] Registered custom elements:',
      DEMOS.map(d => d.name)
    );
  }
})();

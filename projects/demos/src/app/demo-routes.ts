import { Route } from '@angular/router';

export const DEMO_ROUTES: Route[] = [
  {
    path: 'active-element',
    title: 'ActiveElement',
    loadComponent: () =>
      import('../demos/active-element/active-element-demo').then(m => m.ActiveElementDemo),
  },
  {
    path: 'battery',
    title: 'Battery',
    loadComponent: () => import('../demos/battery/battery-demo').then(m => m.BatteryDemo),
  },
  {
    path: 'bluetooth',
    title: 'Bluetooth',
    loadComponent: () => import('../demos/bluetooth/bluetooth-demo').then(m => m.BluetoothDemo),
  },
  {
    path: 'breakpoints',
    title: 'Breakpoints',
    loadComponent: () =>
      import('../demos/breakpoints/breakpoints-demo').then(m => m.BreakpointsDemo),
  },
  {
    path: 'broadcast-channel',
    title: 'BroadcastChannel',
    loadComponent: () =>
      import('../demos/broadcast-channel/broadcast-channel-demo').then(m => m.BroadcastChannelDemo),
  },
  {
    path: 'browser-language',
    title: 'BrowserLanguage',
    loadComponent: () =>
      import('../demos/browser-language/browser-language-demo').then(m => m.BrowserLanguageDemo),
  },
  {
    path: 'clipboard',
    title: 'Clipboard',
    loadComponent: () => import('../demos/clipboard/clipboard-demo').then(m => m.ClipboardDemo),
  },
  {
    path: 'debounced',
    title: 'Debounced',
    loadComponent: () => import('../demos/debounced/debounced-demo').then(m => m.DebouncedDemo),
  },
  {
    path: 'device-pixel-ratio',
    title: 'DevicePixelRatio',
    loadComponent: () =>
      import('../demos/device-pixel-ratio/device-pixel-ratio-demo').then(
        m => m.DevicePixelRatioDemo
      ),
  },
  {
    path: 'device-posture',
    title: 'DevicePosture',
    loadComponent: () =>
      import('../demos/device-posture/device-posture-demo').then(m => m.DevicePostureDemo),
  },
  {
    path: 'display-media',
    title: 'DisplayMedia',
    loadComponent: () =>
      import('../demos/display-media/display-media-demo').then(m => m.DisplayMediaDemo),
  },
  {
    path: 'dropzone',
    title: 'Dropzone',
    loadComponent: () => import('../demos/dropzone/dropzone-demo').then(m => m.DropzoneDemo),
  },
  {
    path: 'element-focus',
    title: 'ElementFocus',
    loadComponent: () =>
      import('../demos/element-focus/element-focus-demo').then(m => m.ElementFocusDemo),
  },
  {
    path: 'element-focus-within',
    title: 'ElementFocusWithin',
    loadComponent: () =>
      import('../demos/element-focus-within/element-focus-within-demo').then(
        m => m.ElementFocusWithinDemo
      ),
  },
  {
    path: 'element-hover',
    title: 'ElementHover',
    loadComponent: () =>
      import('../demos/element-hover/element-hover-demo').then(m => m.ElementHoverDemo),
  },
  {
    path: 'element-size',
    title: 'ElementSize',
    loadComponent: () =>
      import('../demos/element-size/element-size-demo').then(m => m.ElementSizeDemo),
  },
  {
    path: 'element-visibility',
    title: 'ElementVisibility',
    loadComponent: () =>
      import('../demos/element-visibility/element-visibility-demo').then(
        m => m.ElementVisibilityDemo
      ),
  },
  {
    path: 'eye-dropper',
    title: 'EyeDropper',
    loadComponent: () =>
      import('../demos/eye-dropper/eye-dropper-demo').then(m => m.EyeDropperDemo),
  },
  {
    path: 'favicon',
    title: 'Favicon',
    loadComponent: () => import('../demos/favicon/favicon-demo').then(m => m.FaviconDemo),
  },
  {
    path: 'file-dialog',
    title: 'FileDialog',
    loadComponent: () =>
      import('../demos/file-dialog/file-dialog-demo').then(m => m.FileDialogDemo),
  },
  {
    path: 'fps',
    title: 'FPS',
    loadComponent: () => import('../demos/fps/fps-demo').then(m => m.FpsDemo),
  },
  {
    path: 'fullscreen',
    title: 'Fullscreen',
    loadComponent: () => import('../demos/fullscreen/fullscreen-demo').then(m => m.FullscreenDemo),
  },
  {
    path: 'gamepad',
    title: 'Gamepad',
    loadComponent: () => import('../demos/gamepad/gamepad-demo').then(m => m.GamepadDemo),
  },
  {
    path: 'geolocation',
    title: 'Geolocation',
    loadComponent: () =>
      import('../demos/geolocation/geolocation-demo').then(m => m.GeolocationDemo),
  },
  {
    path: 'input-modality',
    title: 'Input Modality',
    loadComponent: () =>
      import('../demos/input-modality/input-modality-demo').then(m => m.InputModalityDemo),
  },
  {
    path: 'intersection-observer',
    title: 'IntersectionObserver',
    loadComponent: () =>
      import('../demos/intersection-observer/intersection-observer-demo').then(
        m => m.IntersectionObserverDemo
      ),
  },
  {
    path: 'interval',
    title: 'Interval',
    loadComponent: () => import('../demos/interval/interval-demo').then(m => m.IntervalDemo),
  },
  {
    path: 'long-press',
    title: 'OnLongPress',
    loadComponent: () => import('../demos/long-press/long-press-demo').then(m => m.LongPressDemo),
  },
  {
    path: 'media-query',
    title: 'MediaQuery',
    loadComponent: () =>
      import('../demos/media-query/media-query-demo').then(m => m.MediaQueryDemo),
  },
  {
    path: 'mouse-position',
    title: 'MousePosition',
    loadComponent: () =>
      import('../demos/mouse-position/mouse-position-demo').then(m => m.MousePositionDemo),
  },
  {
    path: 'mutation-observer',
    title: 'MutationObserver',
    loadComponent: () =>
      import('../demos/mutation-observer/mutation-observer-demo').then(m => m.MutationObserverDemo),
  },
  {
    path: 'network',
    title: 'Network',
    loadComponent: () => import('../demos/network/network-demo').then(m => m.NetworkDemo),
  },
  {
    path: 'on-click-outside',
    title: 'OnClickOutside',
    loadComponent: () =>
      import('../demos/on-click-outside/on-click-outside-demo').then(m => m.OnClickOutsideDemo),
  },
  {
    path: 'online',
    title: 'Online',
    loadComponent: () => import('../demos/online/online-demo').then(m => m.OnlineDemo),
  },
  {
    path: 'page-visibility',
    title: 'PageVisibility',
    loadComponent: () =>
      import('../demos/page-visibility/page-visibility-demo').then(m => m.PageVisibilityDemo),
  },
  {
    path: 'permission-state',
    title: 'PermissionState',
    loadComponent: () =>
      import('../demos/permission-state/permission-state-demo').then(m => m.PermissionStateDemo),
  },
  {
    path: 'picture-in-picture',
    title: 'PictureInPicture',
    loadComponent: () =>
      import('../demos/picture-in-picture/picture-in-picture-demo').then(
        m => m.PictureInPictureDemo
      ),
  },
  {
    path: 'pointer-swipe',
    title: 'PointerSwipe',
    loadComponent: () =>
      import('../demos/pointer-swipe/pointer-swipe-demo').then(m => m.PointerSwipeDemo),
  },
  {
    path: 'resize-observer',
    title: 'ResizeObserver',
    loadComponent: () =>
      import('../demos/resize-observer/resize-observer-demo').then(m => m.ResizeObserverDemo),
  },
  {
    path: 'screen-orientation',
    title: 'ScreenOrientation',
    loadComponent: () =>
      import('../demos/screen-orientation/screen-orientation-demo').then(
        m => m.ScreenOrientationDemo
      ),
  },
  {
    path: 'scroll',
    title: 'ScrollPosition',
    loadComponent: () =>
      import('../demos/scroll/scroll-position-demo').then(m => m.ScrollPositionDemo),
  },
  {
    path: 'speech-recognition',
    title: 'SpeechRecognition',
    loadComponent: () =>
      import('../demos/speech-recognition/speech-recognition-demo').then(
        m => m.SpeechRecognitionDemo
      ),
  },
  {
    path: 'speech-synthesis',
    title: 'SpeechSynthesis',
    loadComponent: () =>
      import('../demos/speech-synthesis/speech-synthesis-demo').then(m => m.SpeechSynthesisDemo),
  },
  {
    path: 'storage',
    title: 'Storage',
    loadComponent: () => import('../demos/storage/storage-demo').then(m => m.StorageDemo),
  },
  {
    path: 'swipe',
    title: 'Swipe',
    loadComponent: () => import('../demos/swipe/swipe-demo').then(m => m.SwipeDemo),
  },
  {
    path: 'text-direction',
    title: 'TextDirection',
    loadComponent: () =>
      import('../demos/text-direction/text-direction-demo').then(m => m.TextDirectionDemo),
  },
  {
    path: 'text-selection',
    title: 'TextSelection',
    loadComponent: () =>
      import('../demos/text-selection/text-selection-demo').then(m => m.TextSelectionDemo),
  },
  {
    path: 'throttled',
    title: 'Throttled',
    loadComponent: () => import('../demos/throttled/throttled-demo').then(m => m.ThrottledDemo),
  },
  {
    path: 'vibration',
    title: 'Vibration',
    loadComponent: () => import('../demos/vibration/vibration-demo').then(m => m.VibrationDemo),
  },
  {
    path: 'web-notification',
    title: 'WebNotification',
    loadComponent: () =>
      import('../demos/web-notification/web-notification-demo').then(m => m.WebNotificationDemo),
  },
  {
    path: 'web-share',
    title: 'WebShare',
    loadComponent: () => import('../demos/web-share/web-share-demo').then(m => m.WebShareDemo),
  },
  {
    path: 'web-worker',
    title: 'WebWorker',
    loadComponent: () => import('../demos/web-worker/web-worker-demo').then(m => m.WebWorkerDemo),
  },
  {
    path: 'window-focus',
    title: 'WindowFocus',
    loadComponent: () =>
      import('../demos/window-focus/window-focus-demo').then(m => m.WindowFocusDemo),
  },
  {
    path: 'window-size',
    title: 'WindowSize',
    loadComponent: () =>
      import('../demos/window-size/window-size-demo').then(m => m.WindowSizeDemo),
  },
];

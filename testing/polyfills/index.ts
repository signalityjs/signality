import { polyfillDOMRect } from './dom-rect';
import { polyfillPointerCapture } from './pointer-capture';
import { polyfillPointerEvent } from './pointer-event';
import { polyfillTouchEvent } from './touch-event';

export function applyPolyfills(): void {
  polyfillDOMRect();
  polyfillPointerEvent();
  polyfillTouchEvent();
  polyfillPointerCapture();
}

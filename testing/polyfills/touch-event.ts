/**
 * TouchEvent polyfill for jsdom.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/TouchEvent
 */
export function polyfillTouchEvent(): void {
  if (typeof globalThis.TouchEvent !== 'undefined') {
    return;
  }

  (globalThis as any).TouchEvent = class TouchEvent extends UIEvent {
    readonly touches: Touch[];
    readonly changedTouches: Touch[];
    readonly targetTouches: Touch[];

    constructor(type: string, params: TouchEventInit & { touches?: Touch[] } = {}) {
      super(type, { bubbles: true, ...params });
      this.touches = params.touches ?? [];
      this.changedTouches = params.changedTouches ?? [];
      this.targetTouches = params.targetTouches ?? [];
    }
  };
}

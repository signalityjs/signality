/**
 * DOMRect polyfill for jsdom.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMRect
 */
export function polyfillDOMRect(): void {
  if (typeof globalThis.DOMRect !== 'undefined') {
    return;
  }

  class DOMRect {
    x: number;
    y: number;
    width: number;
    height: number;
    top: number;
    right: number;
    bottom: number;
    left: number;

    constructor(x = 0, y = 0, width = 0, height = 0) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;

      this.top = height < 0 ? y + height : y;
      this.right = width < 0 ? x : x + width;
      this.bottom = height < 0 ? y : y + height;
      this.left = width < 0 ? x + width : x;
    }

    static fromRect(rectangle?: Partial<DOMRect>) {
      return new DOMRect(rectangle?.x, rectangle?.y, rectangle?.width, rectangle?.height);
    }

    toJSON() {
      return {
        x: this.x,
        y: this.y,
        width: this.width,
        height: this.height,
        top: this.top,
        right: this.right,
        bottom: this.bottom,
        left: this.left,
      };
    }
  }

  (globalThis as any).DOMRect = DOMRect;
}

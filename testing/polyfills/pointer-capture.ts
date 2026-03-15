/**
 * Element.setPointerCapture/releasePointerCapture polyfill for jsdom.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/setPointerCapture
 */
export function polyfillPointerCapture(): void {
  if (typeof Element.prototype.setPointerCapture === 'function') {
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  Element.prototype.setPointerCapture = function () {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  Element.prototype.releasePointerCapture = function () {};
}

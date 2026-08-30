/**
 * @internal
 */
export function getFullscreenElement(document: Document): Element | null {
  let fullscreenElement = document.fullscreenElement;

  // `fullscreenElement` is retargeted against the tree it is read from, so a document reports
  // the shadow host instead of the element that actually went fullscreen.
  // See https://fullscreen.spec.whatwg.org/#dom-documentorshadowroot-fullscreenelement
  while (fullscreenElement && fullscreenElement.shadowRoot) {
    const newFullscreenElement = fullscreenElement.shadowRoot.fullscreenElement;
    // A host with a shadow root can be the fullscreen element itself, in which case its shadow
    // root reports `null` and the host is the element we are looking for.
    if (!newFullscreenElement || newFullscreenElement === fullscreenElement) {
      break;
    } else {
      fullscreenElement = newFullscreenElement;
    }
  }

  return fullscreenElement;
}

export function getPipElement(document: Document): Element | null {
  let pipElement = document.pictureInPictureElement;

  while (pipElement && pipElement.shadowRoot) {
    const newPipElement = pipElement.shadowRoot.pictureInPictureElement;
    if (newPipElement === pipElement) {
      break;
    } else {
      pipElement = newPipElement;
    }
  }

  return pipElement;
}

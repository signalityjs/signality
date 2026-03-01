export function getShadowRoot(element: Element | null): ShadowRoot | null {
  const rootNode = element?.getRootNode ? element.getRootNode() : null;

  if (rootNode instanceof ShadowRoot) {
    return rootNode;
  }

  return null;
}

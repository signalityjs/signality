export function isNodeWithin(node: Node, root: Element): boolean {
  return root === node || root.contains(node) || (root.shadowRoot?.contains(node) ?? false);
}

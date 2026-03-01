export function isElement(obj: Element | EventTarget | Node | object | null): obj is Element {
  return !!obj && (obj as Element).nodeType === Node.ELEMENT_NODE;
}

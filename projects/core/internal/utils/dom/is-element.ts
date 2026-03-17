export function isElement(value: unknown): value is Element {
  return !!value && (value as Element).nodeType === Node.ELEMENT_NODE;
}

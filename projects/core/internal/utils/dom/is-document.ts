/**
 * @internal
 */
export function isDocument(obj: object | null): obj is Document {
  return !!obj && (obj as Document).nodeType === 9; /* Node.DOCUMENT_NODE */
}

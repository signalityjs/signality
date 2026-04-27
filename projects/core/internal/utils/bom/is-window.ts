/**
 * @internal
 */
export function isWindow(obj: object | null): obj is Window {
  return !!obj && (obj as Window).window === obj;
}

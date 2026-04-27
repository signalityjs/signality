/**
 * @internal
 */
export function isEventTarget(value: unknown): value is EventTarget {
  return typeof (value as EventTarget)?.addEventListener === 'function';
}

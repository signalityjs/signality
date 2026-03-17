export function isEventTarget(value: unknown): value is EventTarget {
  return value instanceof EventTarget;
}

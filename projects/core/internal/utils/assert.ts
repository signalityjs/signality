import { isElement, isEventTarget } from './dom';

/**
 * @internal
 */
export function assertElement(value: unknown, source: string): asserts value is Element {
  if (!isElement(value)) {
    throw new Error(
      `[${source}] Expected a DOM Element, ElementRef but received: ${
        (value as object).constructor?.name ?? typeof value
      }. ` +
        `If you are using viewChild/contentChild, make sure to specify "{ read: ElementRef }" to avoid implicit directive references.`
    );
  }
}

/**
 * @internal
 */
export function assertEventTarget(value: unknown, source: string): asserts value is EventTarget {
  if (!isEventTarget(value)) {
    throw new Error(
      `[${source}] Expected an EventTarget, ElementRef but received: ${
        (value as object).constructor?.name ?? typeof value
      }. ` +
        `If you are using viewChild/contentChild, specify "{ read: ElementRef }" to avoid implicit directive references.`
    );
  }
}

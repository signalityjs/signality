/**
 * Empty synchronous function stub.
 * Used for SSR compatibility when returning method functions in Ref objects that should do nothing on the server.
 *
 * Example: `close: NOOP_FN` in {@link WebNotificationRef}
 * @internal
 */
export const NOOP_FN: (...args: any[]) => void = () => {
  /* empty */
};

/**
 * Empty asynchronous function stub that returns a resolved Promise.
 * Used for SSR compatibility when returning async method functions in Ref objects that should do nothing on the server.
 *
 * Example: `share: NOOP_ASYNC_FN` in {@link WebShareRef}
 * @internal
 */
export const NOOP_ASYNC_FN = () => Promise.resolve();

/**
 * Frozen EffectRef stub with a no-op destroy method.
 * Used for SSR compatibility when returning EffectRef from observer utilities (ResizeObserver, MutationObserver, etc.)
 * that cannot run on the server. Prevents errors when calling destroy() on server-rendered refs.
 *
 * Example: `return NOOP_EFFECT_REF` in {@link resizeObserver}
 * @internal
 */
export const NOOP_EFFECT_REF = { destroy: NOOP_FN };

/**
 * Equality function that always returns false, forcing signal updates on every change.
 * Used for signals that hold mutable objects (like Selection, Range) where reference equality is not sufficient
 * and we need to detect changes even when the object structure appears the same.
 *
 * Example: `signal<Selection | null>(null, { equal: ALWAYS_FALSE_FN })` in {@link textSelection}
 * @internal
 */
export const ALWAYS_FALSE_FN = () => false;

/**
 * https://github.com/microsoft/TypeScript/issues/29729
 * @internal
 */
export type Union<T, U> = T | (U & {});

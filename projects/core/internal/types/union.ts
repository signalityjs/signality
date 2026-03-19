// https://github.com/microsoft/TypeScript/issues/29729
export type Union<T, U> = T | (U & {});

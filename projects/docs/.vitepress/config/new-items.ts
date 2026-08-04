export const NEW_ITEMS = [
  '/elements/on-key',
  '/router/query-params',
];

export function isNew(link: string): boolean {
  return NEW_ITEMS.includes(link);
}

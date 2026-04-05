export const NEW_ITEMS = [
  '/elements/element-focus'
];

export function isNew(link: string): boolean {
  return NEW_ITEMS.includes(link);
}

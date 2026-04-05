export const NEW_ITEMS = [
  '/browser/text-selection',
  '/elements/element-focus',
  '/utilities/generate-id'
];

export function isNew(link: string): boolean {
  return NEW_ITEMS.includes(link);
}

export const NEW_ITEMS = [
  '/resources/changelog',
  '/browser/text-selection',
  '/elements/element-focus',
  '/utilities/generate-id'
];

export function isNew(link: string): boolean {
  return NEW_ITEMS.includes(link);
}

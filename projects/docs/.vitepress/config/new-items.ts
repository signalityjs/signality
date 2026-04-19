export const NEW_ITEMS = [
  '/resources/changelog',
  '/browser/text-selection',
  '/browser/device-pixel-ratio',
  '/elements/element-focus',
  '/utilities/generate-id',
  '/utilities/create-injectable',
];

export function isNew(link: string): boolean {
  return NEW_ITEMS.includes(link);
}
